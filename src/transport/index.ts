import { CONCURRENT_ERROR_CODE, RETRY_ERROR_CODES } from '../consts';
import FetchResponse from './fetch-response';
import { FETCH_NETWORK_CONNECTION_ERROR } from '../texts';
import { FetchMethod, Logger } from '../types/dashboard';
import { ResolveCommand } from '../types/resolve';

const MAX_RETRY_COUNT   = 10;

function removeNullValues (key, value) {
    if (value !== null) return value;

    return void 0;
}

export default class Transport {
    private _authenticationToken: string;
    private _dashboardUrl: string;
    private _isLogEnabled: boolean;
    private _logger: Logger;

    private _fetch: FetchMethod;

    constructor (fetch: FetchMethod, dashboardUrl: string, authenticationToken: string, isLogEnabled: boolean, logger: Logger) {
        this._authenticationToken = authenticationToken;
        this._dashboardUrl        = dashboardUrl;
        this._isLogEnabled        = isLogEnabled;
        this._logger              = logger;

        this._fetch = fetch;
    }

    async _sendCommand (command: ResolveCommand): Promise<FetchResponse> {
        return this.fetch(`${this._dashboardUrl}/api/commands/`, {
            method:  'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie':       `tc-dashboard-jwt=${this._authenticationToken}`
            },

            body: JSON.stringify(command, removeNullValues)
        });
    }

    async fetch (url: string, requestOptions): Promise<FetchResponse> {
        let retryCount = 0;
        let error      = null;

        do {
            try {
                return new FetchResponse(await this._fetch(url, requestOptions));
            }
            catch (e) {
                if (this._isLogEnabled)
                    this._logger.log(`${FETCH_NETWORK_CONNECTION_ERROR} ${url}. Retry count: ${retryCount}`);

                if (RETRY_ERROR_CODES.includes(e.code))
                    continue;

                error = e;
            }
        } while (retryCount++ <= MAX_RETRY_COUNT);

        return new FetchResponse(null, FETCH_NETWORK_CONNECTION_ERROR, error);
    }

    async fetchFromDashboard (relativeUrl: string) {
        return await this.fetch(`${this._dashboardUrl}/${relativeUrl}`, {
            method:  'GET',
            headers: {
                authorization: `Bearer ${this._authenticationToken}`
            }
        });
    }

    async sendResolveCommand (command: ResolveCommand): Promise<void> {
        const { aggregateId, type: commandType } = command;

        if (!this._authenticationToken)
            return;

        let response = null;

        let retryCount = 0;

        do {
            response = await this._sendCommand(command);

            retryCount++;

            if (!response.ok)
                this._logger.error(`${aggregateId} ${commandType} ${response}`);
            else if (this._isLogEnabled)
                this._logger.log(`${aggregateId} ${commandType} ${response}`);

        } while (response.status === CONCURRENT_ERROR_CODE && retryCount <= MAX_RETRY_COUNT);
    }
}

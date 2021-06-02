import { CLIENTTIMEOUT_ERROR_MSG, CONCURRENT_ERROR_CODE, REQUEST_TIMEOUT, RETRY_ERROR_CODES } from '../consts';
import FetchResponse from './fetch-response';
import { FETCH_NETWORK_CONNECTION_ERROR } from '../texts';
import { FetchMethod, Logger, ResolveCommand } from '../types/internal/';


const MAX_RETRY_COUNT = 10;

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
        }, REQUEST_TIMEOUT);
    }

    async _fetchWithRequestTimeout (url: string, requestOptions, requestTimeout: number): Promise<Response> {
        let timeout: NodeJS.Timeout | null = null;

        const result = await new Promise<Response>((resolve, reject) => {
            timeout = setTimeout(() => {
                reject(new Error(CLIENTTIMEOUT_ERROR_MSG));
            }, requestTimeout);

            this._fetch(url, requestOptions).then(resolve, reject);
        });

        if (timeout)
            clearTimeout(timeout);

        return result;
    }

    async fetch (url: string, requestOptions, requestTimeout?: number): Promise<FetchResponse> {
        let retryCount = 0;

        do {
            try {
                if (requestTimeout !== void 0)
                    return new FetchResponse(await this._fetchWithRequestTimeout(url, requestOptions, requestTimeout));

                return new FetchResponse(await this._fetch(url, requestOptions));
            }
            catch (e) {
                if (this._isLogEnabled)
                    this._logger.log(`${FETCH_NETWORK_CONNECTION_ERROR} ${url}. Retry count: ${retryCount}`);

                if (RETRY_ERROR_CODES.includes(e.code) && retryCount++ < MAX_RETRY_COUNT)
                    continue;
                else
                    return new FetchResponse(null, FETCH_NETWORK_CONNECTION_ERROR, e);
            }
        } while (true);
    }

    async fetchFromDashboard (relativeUrl: string) {
        return await this.fetch(`${this._dashboardUrl}/${relativeUrl}`, {
            method:  'GET',
            headers: {
                authorization: `Bearer ${this._authenticationToken}`
            }
        }, REQUEST_TIMEOUT);
    }

    async sendResolveCommand (command: ResolveCommand): Promise<void> {
        const { aggregateId, type: commandType } = command;

        if (!this._authenticationToken)
            return;

        let response: FetchResponse;

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

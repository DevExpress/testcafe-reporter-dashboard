import {
    CLIENTTIMEOUT_ERROR_MSG,
    CONCURRENT_ERROR_CODE,
    RETRY_ERROR_CODES,
    SERVICE_UNAVAILABLE_ERROR_CODE
} from '../consts';

import FetchResponse from './fetch-response';
import { FETCH_NETWORK_CONNECTION_ERROR } from '../texts';
import { FetchMethod, Logger, ResolveCommand } from '../types/internal/';

function removeNullValues (key, value) {
    if (value !== null) return value;

    return void 0;
}

export default class Transport {
    private _authenticationToken: string;
    private _dashboardUrl: string;
    private _isLogEnabled: boolean;
    private _logger: Logger;
    private _responseTimeout: number;
    private _requestRetryCount: number;

    private _fetch: FetchMethod;

    constructor (fetch: FetchMethod, dashboardUrl: string, authenticationToken: string, isLogEnabled: boolean, logger: Logger, responseTimeout: number, requestRetryCount: number) {
        this._authenticationToken = authenticationToken;
        this._dashboardUrl        = dashboardUrl;
        this._isLogEnabled        = isLogEnabled;
        this._logger              = logger;
        this._responseTimeout     = responseTimeout;
        this._requestRetryCount   = requestRetryCount;

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
        }, this._responseTimeout);
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
        let response: FetchResponse;

        do {
            try {
                if (requestTimeout !== void 0)
                    response = new FetchResponse(await this._fetchWithRequestTimeout(url, requestOptions, requestTimeout));
                else
                    response = new FetchResponse(await this._fetch(url, requestOptions));
            }
            catch (e) {
                if (this._isLogEnabled)
                    this._logger.log(`${FETCH_NETWORK_CONNECTION_ERROR} ${url}. Retry count: ${retryCount}`);

                if (RETRY_ERROR_CODES.includes(e.code) && retryCount++ < this._requestRetryCount)
                    continue;

                return new FetchResponse(null, FETCH_NETWORK_CONNECTION_ERROR, e);
            }

            if (response.status === SERVICE_UNAVAILABLE_ERROR_CODE && retryCount++ < this._requestRetryCount) {
                if (this._isLogEnabled)
                    this._logger.log(`${url} ${response}`);

                continue;
            }

            return response;
        } while (true);
    }

    async fetchFromDashboard (relativeUrl: string) {
        return await this.fetch(`${this._dashboardUrl}/${relativeUrl}`, {
            method:  'GET',
            headers: {
                authorization: `Bearer ${this._authenticationToken}`
            }
        }, this._responseTimeout);
    }

    async sendResolveCommand (command: ResolveCommand): Promise<void> {
        const { aggregateId, type: commandType } = command;

        if (!this._authenticationToken)
            return;

        const response = await this._sendCommand(command);

        if (!response.ok)
            this._logger.error(`${aggregateId} ${commandType} ${response}`);
        else if (this._isLogEnabled)
            this._logger.log(`${aggregateId} ${commandType} ${response}`);
    }
}

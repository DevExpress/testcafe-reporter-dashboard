import isomorphicFetch from 'isomorphic-fetch';
import { FETCH_NETWORK_CONNECTION_ERROR } from './texts';

export class FetchResponse {
    ok = false;
    status = 0;
    statusText: string;

    private _error?: any;
    private _response?: Response;

    constructor (response, statusText = '', error?) {
        if (response) {
            this.ok = response.ok;
            this.status = response.status;
            this.statusText = response.statusText;
        }
        else
            this.statusText = statusText;

        this._error = error;
        this._response = response;
    }

    toString (): string {
        let result = `${this.status}: ${this.statusText}`;

        if (this._error && this._error.hasOwnProperty('toString'))
            result += `. Error: ${this._error}`;

        if (this._response)
            result += `. Original response: ${this._response}`;

        return result;
    }

    async json (): Promise<any> {
        if (this._response)
            return await this._response.json();

        return null;
    }
}

export default async function fetch (url: string, requestOptions): Promise<FetchResponse> {
    try {
        const response = await isomorphicFetch(url, requestOptions);

        return new FetchResponse(response);
    }
    catch (error) {
        return new FetchResponse(null, FETCH_NETWORK_CONNECTION_ERROR, error);
    }
}

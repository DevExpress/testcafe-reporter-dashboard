export default class FetchResponse {
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
        let result = `${this.status} - ${this.statusText}`;

        if (this._error)
            result += `. ${this._error}`;

        if (this._response)
            result += `. Original response: ${JSON.stringify(this._response)}`;

        return result;
    }

    async json (): Promise<any> {
        if (this._response)
            return await this._response.json();

        return null;
    }
}

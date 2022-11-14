import { RunState } from './types/run';
import { UploadInfo } from './types/internal';

export const RUN_STATE_UPLOAD_PERIOD = 10000;

export interface Uploader {
    getUploadInfo (uploadEntityId: string): Promise<UploadInfo>;
    upload (uploadUrl: string, uploadEntity: Buffer): Promise<void>;
}

export interface RunStateProvider {
    getRunState(): Partial<RunState>;
}

function skipEmptyValues (key, value) {
    return value instanceof RegExp ? value.toString() : value;
}

export class RunStateUploader {
    private _runStateProvider: RunStateProvider;
    private _uploader: Uploader;
    private _timeoutId: NodeJS.Timeout;
    private _uploadInfo: UploadInfo;
    private _runStateUploadPeriod: number;

    async _uploadRunState () {
        const runState = this._runStateProvider.getRunState();

        const buffer = Buffer.from(JSON.stringify(runState, skipEmptyValues));

        await this._uploader.upload(this._uploadInfo.uploadUrl, buffer);
    }

    async _timeoutCallback () {
        clearTimeout(this._timeoutId);

        try {
            await this._uploadRunState();
        }
        finally {
            this._setupUploadTimeout();
        }
    }

    _setupUploadTimeout () {
        this._timeoutId = setTimeout(this._timeoutCallback, this._runStateUploadPeriod);
    }

    constructor (uploader: Uploader, runStateProvider: RunStateProvider, runStateUploadPeriod = RUN_STATE_UPLOAD_PERIOD) {
        this._uploader = uploader;
        this._runStateProvider = runStateProvider;
        this._runStateUploadPeriod = runStateUploadPeriod;

        this._timeoutCallback = this._timeoutCallback.bind(this);
    }

    async start (runId: string) {
        this._uploadInfo = await this._uploader.getUploadInfo(runId);

        this._uploadRunState();
        this._setupUploadTimeout();

        return this._uploadInfo.uploadId;
    }

    async end () {
        clearTimeout(this._timeoutId);

        await this._uploadRunState();
    }
}

import { AggregateCommandType, AggregateNames, DashboardTestRunInfo, ReadFileMethod, UploadStatus } from './types/dashboard';
import { UploadInfo } from './types/resolve';
import logger from './logger';
import { createGetUploadInfoError, createFileUploadError, createTestUploadError } from './texts';
import Transport from './transport';

export class Uploader {
    private _runId: string;
    private _transport: Transport;
    private _uploads: Promise<void>[];

    private _readFile: ReadFileMethod;

    constructor (runId: string, readFile: ReadFileMethod, transport: Transport) {
        this._runId    = runId;
        this._transport = transport;
        this._uploads  = [];

        this._readFile = readFile;
    }

    private async _getUploadInfo (uploadEntityId: string): Promise<UploadInfo> {
        const response = await this._transport.fetchFromDashboard(`api/uploader/getUploadUrl?dir=${this._runId}`);

        if (response.ok)
            return await response.json();

        logger.error(createGetUploadInfoError(uploadEntityId, response.toString()));

        return null;
    }

    private async _upload (uploadInfo: UploadInfo, uploadEntity: Buffer, uploadError: string): Promise<void> {
        const { uploadUrl, uploadId } = uploadInfo;

        const response = await this._transport.fetch(uploadUrl, {
            method:  'PUT',
            headers: {
                'Content-Length': uploadEntity.length
            },
            body: uploadEntity
        });

        await this._transport.sendResolveCommand({
            aggregateId:   uploadId,
            aggregateName: AggregateNames.Upload,
            type:          AggregateCommandType.createUpload,

            payload: { reportId: this._runId, status: response.ok ? UploadStatus.Completed : UploadStatus.Failed }
        });

        if (!response.ok)
            logger.error(`${uploadError}. Response: ${response}`);
    }

    async uploadFile (filePath: string): Promise<string> {
        const uploadInfo = await this._getUploadInfo(filePath);

        if (!uploadInfo) return null;

        const file = await this._readFile(filePath);

        this._uploads.push(this._upload(uploadInfo, file, createFileUploadError(uploadInfo.uploadId, filePath)));

        return uploadInfo.uploadId;
    }

    async uploadTest (testName: string, testRunInfo: DashboardTestRunInfo): Promise<string> {
        const uploadInfo = await this._getUploadInfo(testName);

        if (!uploadInfo) return null;

        const buffer = Buffer.from(JSON.stringify(testRunInfo, (key, value) => value instanceof RegExp ? value.toString() : value));

        this._uploads.push(this._upload(uploadInfo, buffer, createTestUploadError(uploadInfo.uploadId, testName)));

        return uploadInfo.uploadId;
    }

    async waitUploads (): Promise<void> {
        await Promise.all(this._uploads);
    }
}

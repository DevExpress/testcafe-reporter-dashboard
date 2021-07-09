import { AggregateCommandType, AggregateNames, Logger, ReadFileMethod, UploadStatus } from './types/internal';
import { UploadInfo } from './types/internal/resolve';
import { createGetUploadInfoError, createFileUploadError, createTestUploadError } from './texts';
import Transport from './transport';
import { DashboardTestRunInfo } from './types/';

export class Uploader {
    private _transport: Transport;
    private _uploads: Promise<void>[];
    private _logger: Logger;

    private _readFile: ReadFileMethod;

    constructor (readFile: ReadFileMethod, transport: Transport, logger: Logger) {
        this._transport = transport;
        this._uploads   = [];
        this._logger    = logger;

        this._readFile = readFile;
    }

    private async _getUploadInfo (uploadEntityId: string): Promise<UploadInfo | null> {
        const response = await this._transport.fetchFromDashboard('api/getUploadUrl');

        if (response.ok)
            return await response.json();

        this._logger.error(createGetUploadInfoError(uploadEntityId, response.toString()));

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

            payload: {
                status: response.ok ? UploadStatus.Completed : UploadStatus.Failed
            }
        });

        if (!response.ok)
            this._logger.error(`${uploadError}. Response: ${response}`);
    }

    async uploadFile (filePath: string): Promise<string | undefined> {
        const uploadInfo = await this._getUploadInfo(filePath);

        if (!uploadInfo) return void 0;

        const file = await this._readFile(filePath);

        this._uploads.push(this._upload(uploadInfo, file, createFileUploadError(uploadInfo.uploadId, filePath)));

        return uploadInfo.uploadId;
    }

    async uploadTest (testName: string, testRunInfo: DashboardTestRunInfo): Promise<string | undefined> {
        const uploadInfo = await this._getUploadInfo(testName);

        if (!uploadInfo) return void 0;

        const buffer = Buffer.from(JSON.stringify(testRunInfo, (key, value) => value instanceof RegExp ? value.toString() : value));

        this._uploads.push(this._upload(uploadInfo, buffer, createTestUploadError(uploadInfo.uploadId, testName)));

        return uploadInfo.uploadId;
    }

    async waitUploads (): Promise<void> {
        await Promise.all(this._uploads);
    }
}

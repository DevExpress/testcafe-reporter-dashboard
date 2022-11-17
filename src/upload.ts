import { FileExistsMethod, Logger, ReadFileMethod } from './types/internal';
import { UploadInfo } from './types/internal/resolve';
import { createGetUploadInfoError, createFileUploadError, createTestUploadError, createWarningUploadError } from './texts';
import Transport from './transport';
import { WarningsInfo } from './types/';
import { getPostfixedPath } from './utils';

export class Uploader {
    private _transport: Transport;
    private _uploads: Promise<void>[];
    private _logger: Logger;

    private _readFile: ReadFileMethod;
    private _fileExists: FileExistsMethod;

    constructor (readFile: ReadFileMethod, fileExists: FileExistsMethod, transport: Transport, logger: Logger) {
        this._transport = transport;
        this._uploads   = [];
        this._logger    = logger;

        this._readFile = readFile;
        this._fileExists = fileExists;
    }

    private async _getUploadInfo (uploadEntityId: string): Promise<UploadInfo | null> {
        const response = await this._transport.fetchFromDashboard('api/getUploadUrl');

        if (response.ok)
            return await response.json();

        this._logger.error(createGetUploadInfoError(uploadEntityId, response.toString()));

        return null;
    }

    private async _upload (uploadInfo: UploadInfo, uploadEntity: Buffer, uploadError: string): Promise<void> {
        const { uploadUrl } = uploadInfo;

        const response = await this._transport.fetch(uploadUrl, {
            method:  'PUT',
            headers: {
                'Content-Length': uploadEntity.length
            },
            body: uploadEntity
        });

        if (!response.ok)
            this._logger.error(`${uploadError}. Response: ${response}`);
    }

    async uploadFile (filePath: string, fileData?: Buffer): Promise<string | undefined> {
        const uploadInfo = await this._getUploadInfo(filePath);

        if (!uploadInfo) return void 0;

        const file = fileData || await this._readFile(filePath);

        this._uploads.push(this._upload(uploadInfo, file, createFileUploadError(uploadInfo.uploadId, filePath)));

        return uploadInfo.uploadId;
    }

    requestUploadEntity ( uploadInfo: UploadInfo, uploadObject: object, error: string): void {
        const buffer = Buffer.from(JSON.stringify(uploadObject, (key, value) => value instanceof RegExp ? value.toString() : value));

        this._uploads.push(this._upload(uploadInfo, buffer, error));
    }

    async uploadTest (uploadEntityId: string, testRunInfo: object): Promise<string | undefined> {
        const uploadInfo = await this._getUploadInfo(uploadEntityId);

        if (!uploadInfo) return void 0;
        this.requestUploadEntity(uploadInfo, testRunInfo, createTestUploadError(uploadInfo.uploadId, uploadEntityId));
        return uploadInfo.uploadId;
    }

    async uploadRunWarning (uploadEntityId: string, warningInfo: WarningsInfo[]): Promise<string | undefined> {
        const uploadInfo = await this._getUploadInfo(uploadEntityId);

        if (!uploadInfo) return void 0;
        this.requestUploadEntity(uploadInfo, warningInfo, createWarningUploadError(uploadInfo.uploadId, uploadEntityId));
        return uploadInfo.uploadId;
    }

    async waitUploads (): Promise<void> {
        await Promise.all(this._uploads);
    }

    async uploadLayoutTestingArtifact (basePath: string, postfix: string): Promise<string | undefined> {
        const filePath = getPostfixedPath(basePath, postfix);

        if (await this._fileExists(filePath) === false)
            return void 0;

        return await this.uploadFile(filePath);
    };
}

import fs from 'fs';
import { promisify } from 'util';
import sendResolveCommand from './send-resolve-command';
import {
    TESTCAFE_DASHBOARD_AUTHENTICATION_TOKEN as AUTHENTICATION_TOKEN,
    TESTCAFE_DASHBOARD_URL
} from './env-variables';
import { CommandTypes, AggregateNames, DashboardTestRunInfo } from './types/dashboard';
import { UploadInfo } from './types/resolve';
import logger from './logger';
import { createGetUploadInfoError, createFileUploadError, createTestUploadError } from './texts';
import fetch from './fetch';

const readFile = promisify(fs.readFile);

export class Uploader {
    private _runId: string;
    private _uploads: Promise<void>[];

    constructor (runId: string) {
        this._runId   = runId;
        this._uploads = [];
    }

    private async _getUploadInfo (uploadEntityId: string): Promise<UploadInfo> {
        const response = await fetch(`${TESTCAFE_DASHBOARD_URL}/api/uploader/getUploadUrl?dir=${this._runId}`, {
            method:  'GET',
            headers: {
                authorization: `Bearer ${AUTHENTICATION_TOKEN}`
            }
        });

        if (response.ok)
            return await response.json();

        logger.error(createGetUploadInfoError(uploadEntityId, response.toString()));

        return null;
    }

    private async _upload (uploadInfo: UploadInfo, uploadEntity: Buffer, uploadError: string): Promise<void> {
        const { uploadUrl, uploadId } = uploadInfo;

        const sizeInBytes = uploadEntity.length;

        await sendResolveCommand({
            aggregateId:   uploadId,
            aggregateName: AggregateNames.Upload,
            type:          CommandTypes.startUpload,

            payload: { reportId: this._runId }
        });

        const response = await fetch(uploadUrl, {
            method:  'PUT',
            headers: {
                'Content-Length': sizeInBytes
            },
            body: uploadEntity
        });

        if (response.ok) {
            await sendResolveCommand({
                aggregateId:   uploadId,
                aggregateName: AggregateNames.Upload,
                type:          CommandTypes.completeUpload
            });

            return;
        }

        logger.error(`${uploadError}. Response: ${response}`);

        await sendResolveCommand({
            aggregateId:   uploadId,
            aggregateName: AggregateNames.Upload,
            type:          CommandTypes.markUploadFailed
        });
    }

    async uploadFile (filePath: string): Promise<string> {
        const uploadInfo = await this._getUploadInfo(filePath);

        if (!uploadInfo) return null;

        const file = await readFile(filePath);

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

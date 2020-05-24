import fs from 'fs';
import { promisify } from 'util';
import sendResolveCommand from './send-resolve-command';
import {
    TESTCAFE_DASHBOARD_AUTHENTICATION_TOKEN as AUTHENTICATION_TOKEN,
    TESTCAFE_DASHBOARD_URL
} from './env-variables';
import { CommandTypes, AggregateNames } from './types/dashboard';
import { UploadInfo } from './types/resolve';
import logger from './logger';
import { createGetUploadInfoError, createUploadError } from './texts';
import fetch from './fetch';

const readFile = promisify(fs.readFile);

export async function getUploadInfo (reportId: string, uploadEntityId: string): Promise<UploadInfo> {
    const response = await fetch(`${TESTCAFE_DASHBOARD_URL}/api/uploader/getUploadUrl?dir=${reportId}`, {
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

export async function upload (uploadEntityId: string, uploadEntity: Buffer, uploadInfo: UploadInfo, reportId: string): Promise<void> {
    const { uploadUrl, uploadId } = uploadInfo;

    const sizeInBytes = uploadEntity.length;

    await sendResolveCommand({
        aggregateId:   uploadId,
        aggregateName: AggregateNames.Upload,
        type:          CommandTypes.startUpload,

        payload: { reportId }
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

    logger.error(createUploadError(uploadId, uploadEntityId, response.toString()));

    await sendResolveCommand({
        aggregateId:   uploadId,
        aggregateName: AggregateNames.Upload,
        type:          CommandTypes.markUploadFailed
    });
}

export async function uploadFile (filePath: string, uploadInfo: UploadInfo, reportId: string): Promise<void> {
    const file = await readFile(filePath);

    upload(filePath, file, uploadInfo, reportId);
}

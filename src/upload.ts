import fs from 'fs';
import { promisify } from 'util';
import sendResolveCommand from './send-resolve-command';
import {
    TESTCAFE_DASHBOARD_AUTHORIZATION_TOKEN as AUTHORIZATION_TOKEN,
    TESTCAFE_DASHBOARD_URL
} from './env-variables';
import { CommandTypes, AggregateNames } from './consts';
import { UploadInfo } from './types';
import logger from './logger';
import { createGetUploadInfoError, createFileUploadError } from './texts';
import fetch from './fetch';

const readFile = promisify(fs.readFile);

export async function getUploadInfo (reportId: string, filePath: string): Promise<UploadInfo> {
    const response = await fetch(`${TESTCAFE_DASHBOARD_URL}/api/uploader/getUploadUrl?dir=${reportId}`, {
        method: 'GET',
        headers: {
            authorization: `Bearer ${AUTHORIZATION_TOKEN}`
        }
    });

    if (response.ok)
        return await response.json();

    logger.error(createGetUploadInfoError(filePath, response.toString()));

    return null;
}

export async function uploadFile (filePath: string, uploadInfo: UploadInfo, reportId: string) {
    const { uploadUrl, uploadId } = uploadInfo;

    const file            = await readFile(filePath);
    const fileSizeInBytes = file.length;

    await sendResolveCommand({
        aggregateId: uploadId,
        aggregateName: AggregateNames.Upload,
        type: CommandTypes.startUpload,

        payload: { reportId }
    });

    const response = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
            'Content-Length': fileSizeInBytes
        },
        body: file
    });

    if (response.ok) {
        await sendResolveCommand({
            aggregateId: uploadId,
            aggregateName: AggregateNames.Upload,
            type: CommandTypes.completeUpload
        });

        return;
    }

    logger.error(createFileUploadError(uploadId, filePath, response.toString()));

    await sendResolveCommand({
        aggregateId: uploadId,
        aggregateName: AggregateNames.Upload,
        type: CommandTypes.markUploadFailed
    });
}

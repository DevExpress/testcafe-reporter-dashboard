import fs from 'fs';
import { promisify } from 'util';
import fetch from 'isomorphic-fetch';
import sendResolveCommand from './send-resolve-command';
import {
    TESTCAFE_DASHBOARD_AUTHORIZATION_TOKEN as AUTHORIZATION_TOKEN,
    TESTCAFE_DASHBOARD_URL
} from './env-variables';
import { CommandTypes, AggregateNames } from './consts';
import { UploadInfo } from './types';

const readFile = promisify(fs.readFile);

function getErrorFromResponse (response) {
    return  new Error(`${response.status} ${response.statusText}`);
}

export async function getUploadInfo (reportId: string): Promise<UploadInfo> {
    return new Promise((resolve, reject) => {
        fetch(`${TESTCAFE_DASHBOARD_URL}/api/uploader/getUploadUrl?dir=${reportId}`, {
            method: 'GET',
            headers: {
                authorization: `Bearer ${AUTHORIZATION_TOKEN}`
            }
        })
        .then(response => {
            if (!response.ok)
                reject({ error: getErrorFromResponse(response) });

            resolve(response.json());
        })
        .catch(error => {
            reject({ error });
        });
    });
}

export async function uploadFile (filePath: string, uploadInfo: UploadInfo) {
    const { uploadUrl, uploadId } = uploadInfo;

    await sendResolveCommand({
        aggregateId: uploadId,
        aggregateName: AggregateNames.File,
        type: CommandTypes.fileNotLoaded
    });

    const file            = await readFile(filePath);
    const fileSizeInBytes = file.length;

    try {
        await sendResolveCommand({
            aggregateId: uploadId,
            aggregateName: AggregateNames.File,
            type: CommandTypes.startLoadingFile
        });

        await new Promise((resolve, reject) => {
            fetch(uploadUrl, {
                method: 'POST',
                headers: {
                    'Content-Length': fileSizeInBytes
                },
                body: file
            })
            .then(response => {
                if (!response.ok)
                    throw getErrorFromResponse(response);
    
                resolve();
            });
        });
    } catch (error) {
        await sendResolveCommand({
            aggregateId: uploadId,
            aggregateName: AggregateNames.File,
            type: CommandTypes.failureLoadingFile,
            payload: { error: error.message }
        });

        return;
    }

    await sendResolveCommand({
        aggregateId: uploadId,
        aggregateName: AggregateNames.File,
        type: CommandTypes.successLoadingFile
    });
}

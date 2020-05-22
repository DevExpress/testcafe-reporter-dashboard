import { TESTCAFE_DASHBOARD_URL, TESTCAFE_DASHBOARD_AUTHENTICATION_TOKEN } from './env-variables';
import { decode } from 'jsonwebtoken';

export const DASHBOARD_LOCATION_NOT_DEFINED  = 'The \'TESTCAFE_DASHBOARD_URL\' environment variable is not defined.';
export const AUTHENTICATION_TOKEN_NOT_DEFINED = 'The \'TESTCAFE_DASHBOARD_AUTHENTICATION_TOKEN\' environment variable is not defined.';
export const FETCH_NETWORK_CONNECTION_ERROR  = 'Connection failed';

export const createReportUrlMessage = (reportId: string): string => {
    const token = decode(TESTCAFE_DASHBOARD_AUTHENTICATION_TOKEN);

    return `Task execution report: ${TESTCAFE_DASHBOARD_URL}/runs/${token.projectId}/${encodeURIComponent(reportId)}`;
};

export const createFileUploadError = (uploadId: string, filePath: string, response: string): string =>
   `Upload failed. Upload id: ${uploadId}, file path: ${filePath}. Response: ${response}`;

export const createGetUploadInfoError = (filePath: string, response: string): string =>
   `Cannot get an upload URL. File path: ${filePath}. Response: ${response}`;

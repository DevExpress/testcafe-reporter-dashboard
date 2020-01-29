import { format } from 'util';
import  { TESTCAFE_DASHBOARD_URL } from './env-variables';

export const DASHBOARD_LOCATION_NOT_DEFINED  = 'The \'TESTCAFE_DASHBOARD_URL\' environment variable is not defined.';
export const AUTHORIZATION_TOKEN_NOT_DEFINED = 'The \'TESTCAFE_DASHBOARD_AUTHORIZATION_TOKEN\' environment variable is not defined.';
export const FETCH_NETWORK_CONNECTION_ERROR  = 'Connection failed';

const REPORT_URL_TEMPLATE             = `Task execution report: ${TESTCAFE_DASHBOARD_URL}/details/%s`;
const FILE_UPLOAD_ERROR_TEMPLATE      = 'Upload failed. Upload id: %s, file path: %s. Response: %s';
const GET_UPLOAD_INFO_ERROR_TEMPLATE  = 'Get upload URL failed. File path: %s. Response: %s';

export function createReportUrlMessage (reportId: string) : string {
    return format(REPORT_URL_TEMPLATE, reportId);
}

export function createFileUploadError (uploadId: string, filePath: string, response: string) {
    return format(FILE_UPLOAD_ERROR_TEMPLATE, uploadId, filePath, response);
}

export function createGetUploadInfoError (filePath: string, response: string) {
    return format(GET_UPLOAD_INFO_ERROR_TEMPLATE, filePath, response);
}

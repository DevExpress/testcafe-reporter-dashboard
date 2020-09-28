import { decode } from 'jsonwebtoken';
import { MAX_BUILD_ID_LENGTH } from './consts';

export const DASHBOARD_LOCATION_NOT_DEFINED  = 'The \'TESTCAFE_DASHBOARD_URL\' environment variable is not defined.';
export const AUTHENTICATION_TOKEN_NOT_DEFINED = 'The \'TESTCAFE_DASHBOARD_AUTHENTICATION_TOKEN\' environment variable is not defined.';
export const FETCH_NETWORK_CONNECTION_ERROR  = 'Connection failed';

export const createReportUrlMessage = (reportId: string, authenticationToken: string, dashboardUrl: string): string => {
    const token = decode(authenticationToken);

    return `Task execution report: ${dashboardUrl}/runs/${token.projectId}/${encodeURIComponent(reportId)}`;
};

export const createFileUploadError = (uploadId: string, filePath: string): string =>
   `Failed to upload visual artifacts. Upload ID: ${uploadId}, file path: ${filePath}.`;

export const createTestUploadError = (uploadId: string, testName: string): string =>
   `Failed to upload a test log. Upload ID: ${uploadId}, test name: ${testName}.`;

export const createGetUploadInfoError = (uploadEntityId: string, response: string): string =>
   `Cannot get an upload URL. Upload entity ID: ${uploadEntityId}. Response: ${response}`;

export const createLongBuildIdError = (buildId: string): string =>
   `Build ID cannot be longer than ${MAX_BUILD_ID_LENGTH} symbols. Build ID: ${buildId}.`;

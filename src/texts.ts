import { MAX_BUILD_ID_LENGTH } from './types/consts';
import createReportUrl from './create-report-url';

export const DASHBOARD_LOCATION_NOT_DEFINED  = 'The \'TESTCAFE_DASHBOARD_URL\' environment variable is not defined.';
export const AUTHENTICATION_TOKEN_NOT_DEFINED = 'Your TestCafe setup does not contain a TestCafe Dashboard token.';
export const AUTHENTICATION_TOKEN_INVALID = 'The TestCafe Dashboard token is not valid. Check the value for typos.';
export const AUTHENTICATION_TOKEN_REJECTED = 'TestCafe Dashboard rejected the authentication token. Confirm that the token has not been revoked.';
export const FETCH_NETWORK_CONNECTION_ERROR  = 'Connection failed';
export const BUILD_ID_IS_NOT_A_STRING_ERROR = 'Invalid parameter value: the Build ID is not a String';

export const createReportUrlMessage = (reportId: string, authenticationToken: string, dashboardUrl: string): string => {
    return `Task execution report: ${createReportUrl(reportId, dashboardUrl, authenticationToken)}`;
};

export const createFileUploadError = (uploadId: string, filePath: string): string =>
   `Failed to upload visual artifacts. Upload ID: ${uploadId}, file path: ${filePath}.`;

export const createTestUploadError = (uploadId: string, testName: string): string =>
   `Failed to upload a test log. Upload ID: ${uploadId}, test name: ${testName}.`;

export const createWarningUploadError = (uploadId: string, uploadEntityId: string): string =>
   `Failed to upload warning data. Upload ID: ${uploadId}, upload entity id: ${uploadEntityId}.`;

export const createGetUploadInfoError = (uploadEntityId: string, response: string): string =>
   `Failed to get an upload URL. Upload entity ID: ${uploadEntityId}. Response: ${response}`;

export const createLongBuildIdError = (buildId: string): string =>
   `Error: The Build ID exceeds the maximum length of ${MAX_BUILD_ID_LENGTH} characters. Build ID: ${buildId}.`;

export const createReporterMethodName = (reporterMethodName: string, errorDetails: string): string =>
   `Error: The "dashboard" reporter could not successfully execute the "${reporterMethodName}" method. Error details: ${errorDetails}`;

export const createGithubInfoError = (error: string): string =>
   `Cannot retrieve information from the Github Actions environment due to an error: ${error}`;

export const createTestCafeVersionInvalidError = (tcVersion: string): string =>
   `Unrecognized version of TestCafe: ${tcVersion}`;

export const createTestCafeVersionIncompatibledError = (tcVersion: string): string =>
   `TestCafe ${tcVersion} is not compatible with TestCafe Dashboard. Please update the "testcafe" package.`;

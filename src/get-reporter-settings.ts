import {
    ENABLE_LOG,
    NO_SCREENSHOT_UPLOAD,
    NO_VIDEO_UPLOAD,
    TESTCAFE_DASHBOARD_AUTHENTICATION_TOKEN as AUTHENTICATION_TOKEN,
    TESTCAFE_DASHBOARD_BUILD_ID,
    TESTCAFE_DASHBOARD_URL,
    CI_INFO,
    RESPONSE_TIMEOUT,
    REQUEST_RETRY_COUNT
} from './env';

export default function getReporterSettings (options) {
    const { token, buildId, noScreenshotUpload, noVideoUpload, isLogEnabled } = options;

    return {
        dashboardUrl:        TESTCAFE_DASHBOARD_URL,
        authenticationToken: token || AUTHENTICATION_TOKEN as string, //is validated in factory
        buildId:             buildId || TESTCAFE_DASHBOARD_BUILD_ID,
        isLogEnabled:        isLogEnabled || ENABLE_LOG,
        noScreenshotUpload:  noScreenshotUpload || NO_SCREENSHOT_UPLOAD,
        noVideoUpload:       noVideoUpload || NO_VIDEO_UPLOAD,
        responseTimeout:     RESPONSE_TIMEOUT,
        requestRetryCount:   REQUEST_RETRY_COUNT,
        ciInfo:              CI_INFO
    };
}

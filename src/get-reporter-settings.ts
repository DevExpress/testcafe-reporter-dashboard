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
import { ReporterPluginOptions } from './types';

export default function getReporterSettings (options: ReporterPluginOptions) {
    const {
        url,
        token,
        buildId,
        noScreenshotUpload,
        noVideoUpload,
        isLogEnabled,
        requestRetryCount,
        responseTimeout
    } = options;

    return {
        dashboardUrl:        url || TESTCAFE_DASHBOARD_URL,
        authenticationToken: token || AUTHENTICATION_TOKEN as string, //is validated in factory
        buildId:             buildId || TESTCAFE_DASHBOARD_BUILD_ID,
        isLogEnabled:        isLogEnabled || ENABLE_LOG,
        noScreenshotUpload:  noScreenshotUpload || NO_SCREENSHOT_UPLOAD,
        noVideoUpload:       noVideoUpload || NO_VIDEO_UPLOAD,
        responseTimeout:     responseTimeout || RESPONSE_TIMEOUT,
        requestRetryCount:   requestRetryCount || REQUEST_RETRY_COUNT,
        ciInfo:              CI_INFO
    };
}

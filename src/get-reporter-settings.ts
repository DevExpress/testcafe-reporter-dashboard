import {
    ENABLE_LOG,
    NO_SCREENSHOT_UPLOAD,
    NO_VIDEO_UPLOAD,
    TESTCAFE_DASHBOARD_AUTHENTICATION_TOKEN as AUTHENTICATION_TOKEN,
    TESTCAFE_DASHBOARD_BUILD_ID,
    TESTCAFE_DASHBOARD_URL,
    CI_INFO,
    LAYOUT_TESTING_ENABLED,
    RESPONSE_TIMEOUT,
    REQUEST_RETRY_COUNT,
    LT_SCREENSHOTS_RELATIVE_PATH,
    LT_DESTINATION_RELATIVE_PATH,
    LT_COMPARER_BASE_PATH
} from './env';
import { ReporterPluginOptions, TaskProperties } from './types';
import { LayoutTestingSettings } from './types/internal';

export function getReporterSettings (options: ReporterPluginOptions) {
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

export function getLayoutTestingSettings (taskProperties: TaskProperties): LayoutTestingSettings {
    const comparerProperties = taskProperties.configuration['screenshots-comparer'] ?? {};

    return {
        layoutTestingEnabled:    LAYOUT_TESTING_ENABLED,
        screenshotsRelativePath: LT_SCREENSHOTS_RELATIVE_PATH || comparerProperties['screenshotsRelativePath'] || '/screenshots',
        destinationRelativePath: LT_DESTINATION_RELATIVE_PATH || comparerProperties['destinationRelativePath'] || '/artifacts/compared-screenshots',
        comparerBasePath:        LT_COMPARER_BASE_PATH || comparerProperties['path'] || './testing'
    };
}

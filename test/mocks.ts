import { DashboardSettings, ReadFileMethod } from '../src/types/internal/dashboard';
import { CI_DETECTION_VARIABLES, CI_INFO_VARIABLES } from './data/ci-variables';

const originalVariables: any = {};

export const TESTCAFE_DASHBOARD_URL = 'http://localhost';

export const UPLOAD_URL_PREFIX = 'http://upload_url/';

export const SETTINGS: DashboardSettings = {
    authenticationToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwcm9qZWN0SWQiOiI4MmUwMTNhNy01YzFlLTRkMzQtODdmZC0xYWRmNzg0ZGM2MDciLCJpYXQiOjE2Mjg4NTQxODF9.j-CKkD-T3IIVw9CMx5-cFu6516v0FXbMJYDT4lbH9rs',
    buildId:             void 0,
    dashboardUrl:        TESTCAFE_DASHBOARD_URL,
    isLogEnabled:        false,
    noScreenshotUpload:  false,
    noVideoUpload:       false,
    responseTimeout:     1000,
    requestRetryCount:   10
};

export const mockReadFile = (() => void 0) as unknown as ReadFileMethod;
export const mockFileExists = () => Promise.resolve(true);

export const clearCIDetectionVariables = () => {
    for (const CIVariable of CI_DETECTION_VARIABLES) {
        originalVariables[CIVariable.name] = process.env[CIVariable.name];

        delete process.env[CIVariable.name];
    }
};

export const restoreCIDetectionVariables = () => {
    for (const CIVariable of CI_DETECTION_VARIABLES)
        process.env[CIVariable.name] = originalVariables[CIVariable.name];
};

export const clearCIInfoVariables = () => {
    for (const CI of CI_INFO_VARIABLES) {
        for (const variable of Object.keys(CI.variables)) {
            originalVariables[variable] = process.env[variable];

            delete process.env[variable];
        }
    }
};

export const restoreCIInfoVariables = () => {
    for (const CI of CI_INFO_VARIABLES) {
        for (const variable of Object.keys(CI.variables))
            process.env[variable] = originalVariables[variable];
    }
};

export const setLayoutSettingsVariables = (enabled: string, screenshotPath: string, destinationPath: string, comparerBasePath: string) => {
    process.env.TESTCAFE_DASHBOARD_DEVEXTREME_LAYOUT_TESTING_ENABLED = enabled;
    process.env.TESTCAFE_DASHBOARD_DEVEXTREME_LT_SCREENSHOTS_DIR     = screenshotPath;
    process.env.TESTCAFE_DASHBOARD_DEVEXTREME_LT_DESTINATION_DIR     = destinationPath;
    process.env.TESTCAFE_DASHBOARD_DEVEXTREME_LT_COMPARER_BASE_DIR   = comparerBasePath;
};

export const stashLayoutSettingsVariables = () => {
    originalVariables.TESTCAFE_DASHBOARD_DEVEXTREME_LAYOUT_TESTING_ENABLED = process.env.TESTCAFE_DASHBOARD_DEVEXTREME_LAYOUT_TESTING_ENABLED;
    originalVariables.TESTCAFE_DASHBOARD_DEVEXTREME_LT_SCREENSHOTS_DIR     = process.env.TESTCAFE_DASHBOARD_DEVEXTREME_LT_SCREENSHOTS_DIR;
    originalVariables.TESTCAFE_DASHBOARD_DEVEXTREME_LT_DESTINATION_DIR     = process.env.TESTCAFE_DASHBOARD_DEVEXTREME_LT_DESTINATION_DIR;
    originalVariables.TESTCAFE_DASHBOARD_DEVEXTREME_LT_COMPARER_BASE_DIR   = process.env.TESTCAFE_DASHBOARD_DEVEXTREME_LT_COMPARER_BASE_DIR;
};

export const restoreLayoutSettingsVariables = () => {
    process.env.TESTCAFE_DASHBOARD_DEVEXTREME_LAYOUT_TESTING_ENABLED = originalVariables.TESTCAFE_DASHBOARD_DEVEXTREME_LAYOUT_TESTING_ENABLED;
    process.env.TESTCAFE_DASHBOARD_DEVEXTREME_LT_SCREENSHOTS_DIR     = originalVariables.TESTCAFE_DASHBOARD_DEVEXTREME_LT_SCREENSHOTS_DIR;
    process.env.TESTCAFE_DASHBOARD_DEVEXTREME_LT_DESTINATION_DIR     = originalVariables.TESTCAFE_DASHBOARD_DEVEXTREME_LT_DESTINATION_DIR;
    process.env.TESTCAFE_DASHBOARD_DEVEXTREME_LT_COMPARER_BASE_DIR   = originalVariables.TESTCAFE_DASHBOARD_DEVEXTREME_LT_COMPARER_BASE_DIR;
};

export const clearLayoutSettingsVariables = () => {
    process.env.TESTCAFE_DASHBOARD_DEVEXTREME_LAYOUT_TESTING_ENABLED = '';
    process.env.TESTCAFE_DASHBOARD_DEVEXTREME_LT_SCREENSHOTS_DIR     = '';
    process.env.TESTCAFE_DASHBOARD_DEVEXTREME_LT_DESTINATION_DIR     = '';
    process.env.TESTCAFE_DASHBOARD_DEVEXTREME_LT_COMPARER_BASE_DIR   = '';
};

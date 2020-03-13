import {
    TestPhase,
    CommandType,
    BrowserInfo,
    Screenshot,
    Quarantine,
    Error, TestRunInfo
} from "./testcafe"

export enum CommandTypes {
    reportTaskStart = 'reportTaskStart',
    reportFixtureStart = 'reportFixtureStart',
    reportTestStart = 'reportTestStart',
    reportTestDone = 'reportTestDone',
    reportTaskDone = 'reportTaskDone',

    startUpload = 'startUpload',
    markUploadFailed = 'markUploadFailed',
    completeUpload = 'completeUpload'
};

export enum AggregateNames {
    Report = 'Report',
    Upload = 'Upload'
};


export type BrowserRunInfo = {
    browser: BrowserInfo,
    actions: TestAction[]
}

export type TestAction = {
    apiName: string,
    testPhase: TestPhase,
    command: Record<string, any> & { type: CommandType },
    errors?: TestError[]
}

export type TestError = {
    userAgent: string;
    screenshotPath: string;
    testRunPhase: string;
    code: string;
    url: string;
    errorModel: string;
}

export const createTestError = (error: Error): TestError => ({
    code: error.code,
    errorModel: '',
    screenshotPath: '',
    testRunPhase: '',
    url: '',
    userAgent: error.userAgent
});

export type DashboardTestRunInfo = {
    warnings: string[];
    durationMs: number;
    unstable: boolean;
    screenshotPath: string;
    screenshots: Screenshot[];
    quarantine: Quarantine;
    skipped: boolean;
    browserRuns?: Record<string, BrowserRunInfo>;
}

export const createDashboardTestRunInfo = (testRunInfo: TestRunInfo): DashboardTestRunInfo => ({
    durationMs: testRunInfo.durationMs,
    quarantine: testRunInfo.quarantine,
    screenshotPath: testRunInfo.screenshotPath,
    screenshots: [...testRunInfo.screenshots],
    skipped: testRunInfo.skipped,
    unstable: testRunInfo.unstable,
    warnings: testRunInfo.warnings
})
import {
    TestPhase,
    CommandType,
    BrowserInfo,
    Screenshot,
    Quarantine,
    Error,
    Video,
    TestRunInfo
} from './testcafe';

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
    browser: BrowserInfo;
    actions: ActionInfo[];
}

export type ActionInfo = {
    apiName: string;
    testPhase: TestPhase;
    command: Record<string, any> & { type: CommandType };
    errors?: TestError[];
}

export type TestError = {
    userAgent: string;
    screenshotPath: string;
    testRunPhase: string;
    code: string;
    errorModel: string;
}

export type DashboardTestRunInfo = {
    warnings: string[];
    durationMs: number;
    unstable: boolean;
    screenshotPath: string;
    screenshots: Screenshot[];
    quarantine: Quarantine;
    skipped: boolean;
    browserRuns: Record<string, BrowserRunInfo>;
    videos: Video[];
}

export const createTestError = (error: Error, errorModel: string): TestError => ({
    code:           error.code,
    screenshotPath: error.screenshotPath,
    testRunPhase:   error.testRunPhase,
    userAgent:      error.userAgent,
    errorModel:     errorModel,
});


export const createDashboardTestRunInfo = (testRunInfo: TestRunInfo, browserRuns: Record<string, BrowserRunInfo>): DashboardTestRunInfo => ({
    durationMs:     testRunInfo.durationMs,
    quarantine:     testRunInfo.quarantine,
    screenshotPath: testRunInfo.screenshotPath,
    screenshots:    [...testRunInfo.screenshots],
    skipped:        testRunInfo.skipped,
    unstable:       testRunInfo.unstable,
    warnings:       testRunInfo.warnings,
    browserRuns:    browserRuns,
    videos:         testRunInfo.videos
});

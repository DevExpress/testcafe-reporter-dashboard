import {
    TestPhase,
    CommandType,
    BrowserInfo,
    Screenshot,
    Quarantine,
    Error,
    Video,
    TestRunInfo,
    TestResult
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
    Run = 'Run',
    Upload = 'Upload'
};


export type BrowserRunInfo = {
    browser: BrowserInfo;
    actions: ActionInfo[];
    thirdPartyError?: TestError;
}

export type ActionInfo = {
    testRunId: string;
    duration?: number;
    apiName: string;
    testPhase: TestPhase;
    command: Record<string, any> & { type: CommandType };
    error?: TestError;
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
    screenshots:    (testRunInfo.screenshots || []).filter(s => !!s.uploadId),
    skipped:        testRunInfo.skipped,
    unstable:       testRunInfo.unstable,
    warnings:       testRunInfo.warnings,
    browserRuns:    browserRuns,
    videos:         (testRunInfo.videos || []).filter(v => !!v.uploadId)
});

export type TaskStartArgs = {
    startTime: Date;
    userAgents: string[];
    testCount: number;
    buildId: string;
};

export type FixtureStartArgs = {
    name: string;
};

export type TestStartArgs = {
    name: string;
};

export type TestDoneArgs = {
    name: string;
    errorCount: number;
    duration: number;
    uploadId: string;
};

export type TaskDoneArgs = {
     endTime: Date;
     passed: number;
     warnings: string[];
     result: TestResult;
     buildId: string;
}


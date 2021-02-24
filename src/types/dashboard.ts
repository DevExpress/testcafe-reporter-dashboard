import { BuildId } from './general';
import fetch from 'isomorphic-fetch';

import {
    TestPhase,
    CommandType,
    BrowserInfo,
    Quarantine,
    Error,
    TestRunInfo,
} from './testcafe';

export enum AggregateCommandType {
    reportTaskStart = 'reportTaskStart',
    reportTestStart = 'reportTestStart',
    reportTestDone = 'reportTestDone',
    reportTaskDone = 'reportTaskDone',

    createUpload = 'createUpload'
};

export enum AggregateNames {
    Run = 'Run',
    Upload = 'Upload'
};

export type BrowserRunInfo = {
    browser: BrowserInfo;
    screenshotUploadIds?: string[];
    videoUploadIds?: string[];
    actions?: ActionInfo[];
    thirdPartyError?: TestError;
}

export type ActionInfo = {
    duration: number;
    apiName: string;
    testPhase: TestPhase;
    command: Record<string, any> & { type: CommandType };
    error?: TestError;
}

export type TestError = {
    testRunPhase: string;
    code: string;
    errorModel: string;
}

export type DashboardTestRunInfo = {
    warnings: string[];
    unstable: boolean;
    quarantine: Quarantine;
    browserRuns: Record<string, BrowserRunInfo>;
}

export const createTestError = (error: Error, errorModel: string): TestError => ({
    code:         error.code,
    testRunPhase: error.testRunPhase,
    errorModel:   errorModel
});

export const createDashboardTestRunInfo = (testRunInfo: TestRunInfo, browserRuns: Record<string, BrowserRunInfo>): DashboardTestRunInfo => ({
    quarantine:  testRunInfo.quarantine,
    unstable:    testRunInfo.unstable,
    warnings:    testRunInfo.warnings,
    browserRuns: browserRuns
});

export enum UploadStatus {
    Completed = 'Completed',
    Failed = 'Failed'
};

export type FetchMethod = typeof fetch;

export interface ReadFileMethod {
    (path: string): Promise<Buffer>;
};

export type DashboardSettings = {
    authenticationToken: string;
    buildId: BuildId;
    dashboardUrl: string;
    isLogEnabled: boolean;
    noScreenshotUpload: boolean;
    noVideoUpload: boolean;
    runId?: string;
};

export type Logger = {
    log (...params): void;
    warn (...params): void;
    error (...params): void;
};

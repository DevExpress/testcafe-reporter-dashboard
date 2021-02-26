import fetch from 'isomorphic-fetch';
import { TestError, TestRunInfo, Error, BrowserRunInfo, DashboardTestRunInfo, BuildId } from '../';

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

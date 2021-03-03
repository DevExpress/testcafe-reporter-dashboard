import fetch from 'isomorphic-fetch';
import {
    TestError,
    TestRunInfo,
    Error,
    BrowserRunInfo,
    DashboardTestRunInfo
} from '../';
import { CIInfo } from '../task-start-args';

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
    buildId: string;
    dashboardUrl: string;
    isLogEnabled: boolean;
    noScreenshotUpload: boolean;
    noVideoUpload: boolean;
    runId?: string;
    ciInfo?: CIInfo;
};

export type Logger = {
    log (...params): void;
    warn (...params): void;
    error (...params): void;
};

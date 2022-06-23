import { BrowserInfo, Meta, ReportedTestStructureItem, TestRunInfo, Error, TestPhase, CommandType, TaskResult, Warning, TaskProperties } from '../';

export type TestStartInfo = {
    testId: string;
    testRunId: string[];
    testRunIds: string[];
}

export type TestCafeActionInfo = {
    browser: BrowserInfo;
    command: Record<string, any> & { type: CommandType };
    duration?: number;
    err?: Error;
    test: {
        name: string;
        phase: TestPhase;
        id: string;
    };
    testRunId: string;
};

export type DashboardBrowserRunInfo = {
    browser: BrowserInfo;
    actions: {
        apiName: string;
        testPhase: TestPhase;
        command: Record<string, any> & { type: CommandType };
        errors: Error[];
    }[];
}


export type decoratorFn = (str: string) => string;

export type ReporterMethods = {
    init?: () => Promise<void>;
    reportTaskStart: (startTime: Date, userAgents: string[], testCount: number, taskStructure: ReportedTestStructureItem[], taskProperties: TaskProperties) => Promise<void>;
    reportFixtureStart: (name: string, path: string, meta: Meta) => Promise<void>;
    reportTestStart?: (name: string, meta: Meta, testStartInfo: TestStartInfo) => Promise<void>;
    reportTestActionStart?: (apiActionName: string, actionInfo: TestCafeActionInfo) => Promise<void>;
    reportTestActionDone?: (apiActionName: string, actionInfo: TestCafeActionInfo) => Promise<void>;
    reportTestDone: (name: string, testRunInfo: TestRunInfo, meta?: Meta) => Promise<void>;
    reportTaskDone: (endTime: Date, passed: number, warnings: string[], result: TaskResult) => Promise<void>;

    reportWarnings: (warnings: Warning) => Promise<void>;
};

export type ReporterPluginObject = ReporterMethods & {
    createErrorDecorator(): Record<string, decoratorFn>;
    getReportUrl(): string;
};

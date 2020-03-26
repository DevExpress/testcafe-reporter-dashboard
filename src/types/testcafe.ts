export enum CommandType {
    click = 'click',
    rightClick = 'right-click',
    doubleClick = 'double-click',
    drag = 'drag',
    dragToElement = 'drag-to-element',
    hover = 'hover',
    typeText = 'type-text',
    selectText = 'select-text',
    selectTextAreaContent = 'select-text-area-content',
    selectEditableContent = 'select-editable-content',
    pressKey = 'press-key',
    wait = 'wait',
    navigateTo = 'navigate-to',
    setFilesToUpload = 'set-files-to-upload',
    clearUpload = 'clear-upload',
    executeClientFunction = 'execute-client-function',
    executeSelector = 'execute-selector',
    takeScreenshot = 'take-screenshot',
    takeElementScreenshot = 'take-element-screenshot',
    takeScreenshotOnFail = 'take-screenshot-on-fail',
    prepareBrowserManipulation = 'prepare-browser-manipulation',
    showAssertionRetriesStatus = 'show-assertion-retries-status',
    hideAssertionRetriesStatus = 'hide-assertion-retries-status',
    setBreakpoint = 'set-breakpoint',
    resizeWindow = 'resize-window',
    resizeWindowToFitDevice = 'resize-window-to-fit-device',
    maximizeWindow = 'maximize-window',
    switchToIframe = 'switch-to-iframe',
    switchToMainWindow = 'switch-to-main-window',
    setNativeDialogHandler = 'set-native-dialog-handler',
    getNativeDialogHistory = 'get-native-dialog-history',
    getBrowserConsoleMessages = 'get-browser-console-messages',
    setTestSpeed = 'set-test-speed',
    setPageLoadTimeout = 'set-page-load-timeout',
    debug = 'debug',
    assertion = 'assertion',
    useRole = 'useRole',
    testDone = 'test-done',
    backupStorages = 'backup-storages',
    executeExpression = 'execute-expression',
    executeAsyncExpression = 'execute-async-expression',
    unlockPage = 'unlock-page',
    recorder = 'recorder'
};

export enum TestPhase {
    initial = 'initial',
    inFixtureBeforeHook = 'inFixtureBeforeHook',
    inFixtureBeforeEachHook = 'inFixtureBeforeEachHook',
    inTestBeforeHook = 'inTestBeforeHook',
    inTest = 'inTest',
    inTestAfterHook = 'inTestAfterHook',
    inFixtureAfterEachHook = 'inFixtureAfterEachHook',
    inFixtureAfterHook = 'inFixtureAfterHook',
    inRoleInitializer = 'inRoleInitializer',
    inBookmarkRestore = 'inBookmarkRestore'
};

export type Error = {
    code: string;
    data: any;
    callsite: {
        filename: string;
        lineNum: number;
        callsiteFrameIdx: number;
        stackFrames: any[];
        isV8Frames: boolean;
    };
    message: string;
    stack: string;
    userAgent: string;
    screenshotPath: string;
    testRunPhase: string;
};

export type BrowserInfo = {
    alias: string;
    engine: { name: string; version: string };
    headless: boolean;
    name: string;
    os: { name: string; version: string };
    platform: string;
    prettyUserAgent: string;
    userAgent: string;
    version: string;
}

type ActionInfo = {
    browser: BrowserInfo;
    command: Record<string, any> & { type: CommandType };
    test: {
        name: string;
        phase: TestPhase;
    };
    errors?: Error[];
};

type Meta = Record<string, string>;

export type Quarantine = {
    [key: number]: {
        passed: boolean;
    };
}

export type Screenshot = {
    screenshotPath: string;
    thumbnailPath: string;
    userAgent: string;
    quarantineAttempt: number;
    takenOnFail: boolean;
    uploadId?: string;
}


interface Video {
    uploadId: string;
    userAgent: string;
    quarantineAttempt: number;
}

type TestRunInfo = {
    errs: TestError[];
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


export type DashboardBrowserRunInfo = {
    browser: BrowserInfo;
    actions: {
        apiName: string;
        testPhase: TestPhase;
        command: Record<string, any> & { type: CommandType };
        errors: Error[];
    }[];
}


type TestResult = {
    failedCount: number;
    passedCount: number;
    skippedCount: number;
}

export type decoratorFn = (str: string) => string;

interface DecoratorType {
    [key: string]: decoratorFn;
}

export type ReporterPluginObject = {
    createErrorDecorator: () => DecoratorType;
    reportTaskStart?: (startTime: Date, userAgents: string[], testCount: number) => Promise<void>;
    reportFixtureStart?: (name: string, path: string, meta: Meta) => Promise<void>;
    reportTestStart?: (name: string, meta: Meta) => Promise<void>;
    reportTestActionStart?: (apiActionName: string, actionInfo: ActionInfo) => Promise<void>;
    reportTestActionDone?: (apiActionName: string, actionInfo: ActionInfo) => Promise<void>;
    reportTestDone?: (name: string, testRunInfo: TestRunInfo, meta: Meta) => Promise<void>;
    reportTaskDone?: (endTime: Date, passed: number, warnings: string[], result: TestResult) => Promise<void>;
};

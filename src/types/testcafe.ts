export type ScreenshotUploadIdSet = {
    current: string;
    baseline?: string;
    diff?: string;
    mask?: string;
    text?: string;
    textMask?: string;
};

export type ScreenshotMapItem = {
    path: string;
    ids: ScreenshotUploadIdSet;
    baselineSourcePath?: string;
    maskSourcePath?: string;
    actionId?: string;
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

export type TestError = {
    testRunPhase: string;
    code: string;
    errorModel: string;
};


export type Error = {
    apiFnChain?: string[];
    apiFnIndex?: number;
    callsite: {
        filename: string;
        lineNum: number;
        callsiteFrameIdx: number;
        stackFrames: any[];
        isV8Frames: boolean;
    };
    code: string;
    errMsg: string;
    isTestCafeError: boolean;
    screenshotPath: string;
    testRunId: string;
    testRunPhase: string;
    userAgent: string;
    id?: string;
};

export type TestRunInfo = {
    browsers: (BrowserInfo & { testRunId: string })[];
    durationMs: number;
    errs: Error[];
    quarantine: Quarantine | null;
    screenshotPath: string | null;
    screenshots: Screenshot[];
    skipped: boolean;
    testId: string;
    unstable: boolean;
    videos: Video[];
    warnings: string[];
}

export type DashboardTestRunInfo = {
    warnings: string[];
    unstable: boolean;
    quarantine: Quarantine | null;
    browserRuns: Record<string, BrowserRunInfo>;
}


export type Meta = Record<string, string>;

export type Quarantine = {
    [key: number]: {
        passed: boolean;
    };
}

export type Screenshot = Readonly<{
    testRunId: string;
    screenshotPath: string;
    thumbnailPath: string;
    userAgent: string;
    quarantineAttempt: number;
    takenOnFail: boolean;
    screenshotData?: Buffer;
}>;

export type Video = Readonly<{
    userAgent: string;
    videoPath: string;
    testRunId: string;
}>;

export type BrowserRunInfo = {
    browser: BrowserInfo;
    screenshotMap?: ScreenshotMapItem[];
    screenshotUploadIds?: string[];
    videoUploadIds?: string[];
    actions?: ActionInfo[];
    thirdPartyError?: TestError;
    quarantineAttempt?: number;
    warnings?: Warning[];
}

export type ActionInfo = {
    duration?: number;
    apiName: string;
    testPhase: TestPhase;
    command: Record<string, any> & { type: CommandType };
    error?: TestError;
    screenshotPath?: string;
}

export type Warning = {
    message: string;
    testRunId?: string;
}

export type WarningsInfo = {
    testRunId?: string;
    warnings: Warning[];
}

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

export type DashboardInfo = {
    type: string;
    message: string;
};

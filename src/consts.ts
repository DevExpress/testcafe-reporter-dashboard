export enum CommandTypes {
    reportTaskStart    = 'reportTaskStart',
    reportFixtureStart = 'reportFixtureStart',
    reportTestStart    = 'reportTestStart',
    reportTestDone     = 'reportTestDone',
    reportTaskDone     = 'reportTaskDone',

    fileNotLoaded      = 'fileNotLoaded',
    startLoadingFile   = 'startLoadingFile',
    failureLoadingFile = 'failureLoadingFile',
    successLoadingFile = 'successLoadingFile'
};

export enum AggregateNames {
    Report = 'Report',
    File   = 'File'
};

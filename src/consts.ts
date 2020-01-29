export enum CommandTypes {
    reportTaskStart    = 'reportTaskStart',
    reportFixtureStart = 'reportFixtureStart',
    reportTestStart    = 'reportTestStart',
    reportTestDone     = 'reportTestDone',
    reportTaskDone     = 'reportTaskDone',

    startUpload    = 'startUpload',
    failUpload     = 'failUpload',
    completeUpload = 'completeUpload'
};

export enum AggregateNames {
    Report = 'Report',
    Upload = 'Upload'
};

import { BuildId, Name, ShortId } from './common';
import { CIInfo } from './task-start-args';

export type Test = {
    duration: number;
    errorCount: number;
    id: ShortId;
    inProgress: boolean;
    name: Name;
    skipped: boolean;
    unstable: boolean;
    uploadId: string;
};

export type Fixture = {
    id: ShortId;
    name: Name;
    testIDs: ShortId[];
};

export type TaskStructure = {
    fixtures: { [key: ShortId]: Fixture };
    tests: { [key: string]: Partial<Test> };
}

export type RunState = TaskStructure & {
    buildId: BuildId;
    ciInfo: CIInfo;
    endTime: Date;
    failed: number;
    id: string;
    passed: number;
    skipped: number;
    startTime: Date;
    testCount: number;
    userAgents: string[];
    warnings: string[];
    warningsUploadId: string;
};

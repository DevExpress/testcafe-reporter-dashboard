import { ReportedTestStructureItem, ShortId, TaskDoneArgs, TaskStartArgs, TestDoneArgs, TestStartArgs } from './types';
import { RunState, TaskStructure, Test } from './types/run';

// TODO: handle sendReportWarningsCommand command
export class RunStateBuilder {
    private _runState: Partial<RunState>;

    private static _normalizeTaskStructure (taskStructure: ReportedTestStructureItem[]): TaskStructure {
        return taskStructure.reduce<TaskStructure>((normalizedTaskStructure, { fixture }) => {
            const fixtureTests = fixture.tests.reduce<{ [key: ShortId]: Partial<Test> }>((normalizedTests, test) => {
                normalizedTests[test.id] = {
                    id:      test.id,
                    name:    test.name,
                    skipped: test.skip
                };

                return normalizedTests;
            }, {});

            normalizedTaskStructure.fixtures[fixture.id] = {
                id:      fixture.id,
                name:    fixture.name,
                testIDs: Object.keys(fixtureTests)
            };

            normalizedTaskStructure.tests = { ...normalizedTaskStructure.tests, ...fixtureTests };

            return normalizedTaskStructure;
        }, { fixtures: {}, tests: {} });
    }

    private _getTestByID (testId: string) {
        if (!this._runState.tests)
            throw new Error('The \'reportTaskStarted\' handler was not processed');

        const test = this._runState.tests[testId];

        if (!test)
            throw new Error(`Unable to find test with ID: ${testId}`);

        return test;
    }

    constructor (runID: string) {
        this._runState = { id: runID };
    }

    reportTaskStarted (payload: TaskStartArgs) {
        const normalizedTaskStructure = RunStateBuilder._normalizeTaskStructure(payload.taskStructure);

        this._runState.buildId    = payload.buildId;
        this._runState.ciInfo     = payload.ciInfo;
        this._runState.fixtures   = normalizedTaskStructure.fixtures;
        this._runState.startTime  = payload.startTime;
        this._runState.testCount  = payload.testCount;
        this._runState.tests      = normalizedTaskStructure.tests;
        this._runState.userAgents = payload.userAgents;
    }

    reportTestStarted (payload: TestStartArgs) {
        const test = this._getTestByID(payload.testId);

        test.skipped    = payload.skipped;
        test.inProgress = true;
    }

    reportTestDone (payload: TestDoneArgs) {
        const test = this._getTestByID(payload.testId);

        test.duration   = payload.duration;
        test.errorCount = payload.errorCount;
        test.inProgress = false;
        test.skipped    = payload.skipped;
        test.unstable   = payload.unstable;
        test.uploadId   = payload.uploadId;
    }

    reportTaskDone (payload: TaskDoneArgs) {
        this._runState.endTime  = payload.endTime;
        this._runState.failed   = payload.result.failedCount;
        this._runState.passed   = payload.passed;
        this._runState.skipped  = payload.result.skippedCount;
        this._runState.warnings = payload.warnings;

        this._runState.warningsUploadId = payload.warningsUploadId;
    }

    getRunState () {
        return this._runState;
    }
}

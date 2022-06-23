
import { TestRunInfo } from '../../src/types/';
import { CHROME } from './test-browser-info';

const TEST_RUN_ID = 'Xsa6hZIR5';
const testId = '';

export const skippedTestDone: TestRunInfo = {
    browsers:       [{ testRunId: TEST_RUN_ID, ...CHROME }],
    durationMs:     1,
    errs:           [],
    quarantine:     null,
    screenshotPath: null,
    screenshots:    [],
    skipped:        true,
    testId,
    unstable:       false,
    videos:         [],
    warnings:       [],
    fixture:        {
        id:   '',
        path: '',
        name: '',
        meta: {}
    }
};

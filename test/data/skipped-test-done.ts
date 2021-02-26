
import { TestRunInfo } from '../../src/types/';
import { CHROME } from './test-browser-info';

export const skippedTestDone: TestRunInfo = {
    browsers:       [{ testRunId: 'Xsa6hZIR1', ...CHROME }],
    durationMs:     1,
    errs:           [],
    quarantine:     null,
    screenshotPath: null,
    screenshots:    [],
    skipped:        true,
    testId:         '',
    unstable:       false,
    videos:         [],
    warnings:       []
};

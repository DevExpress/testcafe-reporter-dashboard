import { TestRunInfo } from '../../src/types/testcafe';

export const EMPTY_TEST_RUN_INFO: TestRunInfo = {
    browsers:       [ ],
    durationMs:     1000,
    errs:           [],
    quarantine:     null,
    screenshotPath: '',
    screenshots:    [],
    skipped:        false,
    testId:         'test_1',
    unstable:       false,
    videos:         [],
    warnings:       [],
    fixture:        {
        id:   '',
        name: '',
        path: '',
        meta: {}
    }
};

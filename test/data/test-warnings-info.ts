import { TestRunInfo } from '../../src/types/testcafe';
import { CHROME, CHROME_HEADLESS, FIREFOX } from './test-browser-info';

export const WARNINGS_TEST_RUN_ID_1 = 'Xsa6hZIR5';
export const WARNINGS_TEST_RUN_ID_2 = 'Xsa6hZIR6';
export const WARNINGS_TEST_RUN_ID_3 = 'Xsa6hZIR67';

const testId = 'testId';

export const testWarningsInfo: TestRunInfo = {
    browsers:   [ { ...FIREFOX, testRunId: WARNINGS_TEST_RUN_ID_1 }, { ...CHROME, testRunId: WARNINGS_TEST_RUN_ID_2 }, { ...CHROME_HEADLESS, testRunId: WARNINGS_TEST_RUN_ID_3 } ],
    durationMs: 1,

    errs: [

    ],

    quarantine:     null,
    screenshotPath: null,
    screenshots:    [],
    skipped:        false,
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

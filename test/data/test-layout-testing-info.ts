import { CommandType, TestPhase, TestRunInfo } from '../../src/types';
import { TestStartInfo } from '../../src/types/internal';
import { CHROME } from './test-browser-info';

const testRunId = 'chrome_1';
const testId    = 'test1';

export const layoutTestingActionInfo1 = {
    duration:  1000,
    browser:   CHROME,
    testRunId: testRunId,
    test:      {
        name:  'Test 1',
        phase: TestPhase.inTest,
        id:    testId
    },
    command: {
        actionId: 'action1',
        type:     CommandType.takeScreenshot,
        selector: 'Selector(\'body\')'
    }
};

export const layoutTestingActionInfo2 = {
    duration:  1000,
    browser:   CHROME,
    testRunId: testRunId,
    test:      {
        name:  'Test 1',
        phase: TestPhase.inTest,
        id:    testId
    },
    command: {
        actionId: 'action2',
        type:     CommandType.click,
        selector: 'Selector(\'#developer-name\')'
    }
};

export const layoutTestingTestStartInfo: TestStartInfo = {
    testId,
    testRunId:  [testRunId],
    testRunIds: []
};

export const layoutTestingTestDoneInfo: TestRunInfo = {
    browsers:   [ { ...CHROME, testRunId: testRunId } ],
    durationMs: 17878,
    errs:       [],
    quarantine: {
        '1': { passed: true }
    },
    screenshotPath: null,
    screenshots:    [
        {
            testRunId,
            screenshotPath:    `%filePath%${testRunId}_1.png`,
            thumbnailPath:     `%filePath%${testRunId}_1.png`,
            userAgent:         '',
            quarantineAttempt: 1,
            takenOnFail:       true,
            actionId:          layoutTestingActionInfo1.command.actionId
        },
        {
            testRunId,
            screenshotPath:    `%filePath%${testRunId}_2.png`,
            thumbnailPath:     `%filePath%${testRunId}_2.png`,
            userAgent:         '',
            quarantineAttempt: 1,
            takenOnFail:       true
        }
    ],
    skipped:  false,
    videos:   [],
    unstable: false,
    warnings: [],
    testId,
    fixture:  {
        id:   '',
        path: '',
        name: '',
        meta: {}
    }
};

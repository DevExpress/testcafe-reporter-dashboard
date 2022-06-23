import { FIREFOX, CHROME, CHROME_HEADLESS } from './test-browser-info';

import { TestRunErrorFormattableAdapter } from 'testcafe/lib/embedding-utils';
import { CommandType, TestPhase, TestRunInfo } from '../../src/types/';
import { TestStartInfo } from '../../src/types/internal';

const testRunId1 = 'firefox_1';
const testRunId2 = 'chrome_1';
const testRunId3 = 'chrome_headless';
const testId     = '1';

const runAttempts = [
    { testRunId: testRunId1, browser: FIREFOX },
    { testRunId: testRunId2, browser: CHROME },
    { testRunId: `${testRunId2}_1`, browser: CHROME },
    { testRunId: testRunId3, browser: CHROME_HEADLESS },
    { testRunId: `${testRunId3}_1`, browser: CHROME_HEADLESS },
    { testRunId: `${testRunId3}_2`, browser: CHROME_HEADLESS },
];

const actionInfo = {
    command: {
        options: {
            speed:     0.5,
            modifiers: { ctrl: true }
        },
        type:     CommandType.click,
        selector: 'Selector(\'#developer-name\')'
    },
    test: {
        name:  'Test 1',
        phase: TestPhase.inTest,
        id:    testId
    }
};

export const testActionInfos = runAttempts.map(attempt => ({ ...actionInfo, ...attempt }));

export const quarantineTestDoneInfo: TestRunInfo = {
    browsers:   [ { ...FIREFOX, testRunId: testRunId1 }, { ...CHROME, testRunId: testRunId2 }, { ...CHROME_HEADLESS, testRunId: testRunId3 } ],
    durationMs: 17878,
    errs:       [
        new TestRunErrorFormattableAdapter(
            {
                apiFnChain: ['Selector(\'#developer-name1\')'],
                apiFnIndex: 0,
                errMsg:     '',
                testRunId:  'chrome_1',
                callsite:   {
                    callsiteFrameIdx: 6,
                    filename:         'c:\\Projects\\testcafe-reporter-dashboard\\sandbox\\test.ts',
                    isV8Frames:       true,
                    lineNum:          7,
                    stackFrames:      [{}]
                },
                code:            'E24',
                isTestCafeError: true,
                screenshotPath:  '',
                testRunPhase:    TestPhase.inTest,
                userAgent:       CHROME.prettyUserAgent,
            },
            {
                screenshotPath: '',
                userAgent:      CHROME.prettyUserAgent,
                testRunId:      'chrome_1',
                testRunPhase:   TestPhase.inTest
            }
        )
    ],
    quarantine: {
        '1': { passed: false },
        '2': { passed: false },
        '3': { passed: false }
    },
    screenshotPath: null,
    screenshots:    runAttempts.map(({ testRunId }) => ({
        testRunId,
        screenshotPath:    `%filePath%${testRunId}.png`,
        thumbnailPath:     `%filePath%${testRunId}.png`,
        userAgent:         '',
        quarantineAttempt: 1,
        takenOnFail:       true
    })),
    skipped: false,
    videos:  [testRunId1, testRunId2, testRunId3].map(testRunId => ({
        testRunId,
        videoPath: `%filePath%${testRunId}.mp4`,
        userAgent: ''
    })),
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

export const quarantiteTestStartInfo: TestStartInfo = {
    testId,
    testRunId:  [testRunId1],
    testRunIds: [],
    skipped:    false
};

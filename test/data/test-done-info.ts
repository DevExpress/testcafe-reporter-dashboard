import { FIREFOX, CHROME } from './test-browser-info';

import { TestRunErrorFormattableAdapter } from 'testcafe/lib/embedding-utils';
import { TestPhase, TestRunInfo } from '../../src/types/';

const testRunId1 = 'firefox_1';
const testRunId2 = 'chrome_1';
const testId = '1';

export const testDoneInfo: TestRunInfo = {
    browsers:   [ { ...FIREFOX, testRunId: testRunId1 }, { ...CHROME, testRunId: testRunId2 } ],
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
        ),
        new TestRunErrorFormattableAdapter(
            {
                apiFnChain: ['Selector(\'#developer-name1\')'],
                apiFnIndex: 0,
                callsite:   {
                    callsiteFrameIdx: 6,
                    filename:         'c:\\Projects\\testcafe-reporter-dashboard\\sandbox\\test.ts',
                    isV8Frames:       true,
                    lineNum:          7,
                    stackFrames:      [{}]
                },
                code:            'E24',
                errMsg:          '',
                isTestCafeError: true,
                screenshotPath:  '',
                testRunId:       'firefox_1',
                testRunPhase:    TestPhase.inTest,
                userAgent:       FIREFOX.prettyUserAgent
            },
            {
                screenshotPath: '',
                userAgent:      CHROME.prettyUserAgent,
                testRunId:      'firefox_1',
                testRunPhase:   TestPhase.inTest
            }
        )
    ],
    quarantine:     null,
    screenshotPath: null,
    screenshots:    [],
    skipped:        false,
    testId,
    videos:         [],
    unstable:       false,
    warnings:       [],
    fixture:        {
        id:   '',
        path: '',
        name: '',
        meta: {}
    }
};


import { TestRunErrorFormattableAdapter } from 'testcafe/lib/embedding-utils';
import { TestRunInfo, TestPhase } from '../../src/types/testcafe';
import { CHROME } from './test-browser-info';

const testId  = 'Test';
const testId2 = 'Test2';

export const TEST_RUN_ID   = 'Xsa6hZIR5';
export const TEST_RUN_ID_2 = '123456ABC';

export const thirdPartyTestDone: TestRunInfo = {
    browsers:   [{ testRunId: TEST_RUN_ID, ...CHROME }],
    durationMs: 1,

    errs: [
        new TestRunErrorFormattableAdapter({
            id:              'action_error',
            userAgent:       CHROME.prettyUserAgent,
            screenshotPath:  '',
            testRunId:       TEST_RUN_ID,
            testRunPhase:    TestPhase.inTestBeforeHook,
            code:            'E2',
            isTestCafeError: true,
            callsite:        {
                filename:         'C:\\Users\\Alfredo\\TestCafeStudio\\Examples\\js-examples.js',
                lineNum:          13,
                callsiteFrameIdx: 0,
                stackFrames:      [],
                isV8Frames:       false
            },
            errMsg:      'Error: In Before',
            originError: `Error: In Before
                at C:\Users\Rb3As\TestCafeStudio\Examples\js-examples.js:14:11
                at Generator.next (<anonymous>)
                at step (C:\Users\Rb3As\AppData\Roaming\npm\node_modules\testcafe\node_modules\babel-runtime\helpers\asyncToGenerator.js:17:30)
                at C:\Users\Rb3As\AppData\Roaming\npm\node_modules\testcafe\node_modules\babel-runtime\helpers\asyncToGenerator.js:35:14
                at new Promise (<anonymous>)
                at new F (C:\Users\Rb3As\AppData\Roaming\npm\node_modules\testcafe\node_modules\core-js\library\modules\_export.js:36:28)
                at C:\Users\Rb3As\AppData\Roaming\npm\node_modules\testcafe\node_modules\babel-runtime\helpers\asyncToGenerator.js:14:12
                at C:\Users\Rb3As\TestCafeStudio\Examples\js-examples.js:12:1
                at $$testcafe_test_run$$Xsa6hZIR5$$ (eval at addTrackingMarkerToFunction (C:\Users\Rb3As\AppData\Roaming\npm\node_modules\testcafe\src\api\test-run-tracker.js:76:16), <anonymous>:7:39)
                at C:\Users\Rb3As\AppData\Roaming\npm\node_modules\testcafe\src\api\wrap-test-function.js:17:28`
        }, {
            screenshotPath: '',
            testRunId:      TEST_RUN_ID,
            testRunPhase:   TestPhase.inTestBeforeHook,
            userAgent:      CHROME.prettyUserAgent
        }),
        new TestRunErrorFormattableAdapter({
            id:              'third_party_error',
            userAgent:       CHROME.prettyUserAgent,
            screenshotPath:  '',
            testRunId:       TEST_RUN_ID,
            testRunPhase:    TestPhase.inTestBeforeHook,
            code:            'E2',
            isTestCafeError: true,
            callsite:        {
                filename:         'C:\\Users\\Alfredo\\TestCafeStudio\\Examples\\js-examples.js',
                lineNum:          13,
                callsiteFrameIdx: 0,
                stackFrames:      [],
                isV8Frames:       false
            },
            errMsg:      'Error: In Before - third party error 1',
            originError: `Error: In Before
                at C:\Users\Rb3As\TestCafeStudio\Examples\js-examples.js:14:11
                at Generator.next (<anonymous>)
                at step (C:\Users\Rb3As\AppData\Roaming\npm\node_modules\testcafe\node_modules\babel-runtime\helpers\asyncToGenerator.js:17:30)
                at C:\Users\Rb3As\AppData\Roaming\npm\node_modules\testcafe\node_modules\babel-runtime\helpers\asyncToGenerator.js:35:14
                at new Promise (<anonymous>)
                at new F (C:\Users\Rb3As\AppData\Roaming\npm\node_modules\testcafe\node_modules\core-js\library\modules\_export.js:36:28)
                at C:\Users\Rb3As\AppData\Roaming\npm\node_modules\testcafe\node_modules\babel-runtime\helpers\asyncToGenerator.js:14:12
                at C:\Users\Rb3As\TestCafeStudio\Examples\js-examples.js:12:1
                at $$testcafe_test_run$$Xsa6hZIR5$$ (eval at addTrackingMarkerToFunction (C:\Users\Rb3As\AppData\Roaming\npm\node_modules\testcafe\src\api\test-run-tracker.js:76:16), <anonymous>:7:39)
                at C:\Users\Rb3As\AppData\Roaming\npm\node_modules\testcafe\src\api\wrap-test-function.js:17:28`
        }, {
            screenshotPath: '',
            testRunId:      TEST_RUN_ID,
            testRunPhase:   TestPhase.inTestBeforeHook,
            userAgent:      CHROME.prettyUserAgent
        })
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

export const thirdPartyTestDone2: TestRunInfo = {
    browsers:   [{ testRunId: TEST_RUN_ID_2, ...CHROME }],
    durationMs: 1,

    errs: [
        new TestRunErrorFormattableAdapter({
            id:              'action_error',
            userAgent:       CHROME.prettyUserAgent,
            screenshotPath:  '',
            testRunId:       TEST_RUN_ID_2,
            testRunPhase:    TestPhase.inTestBeforeHook,
            code:            'E2',
            isTestCafeError: true,
            callsite:        {
                filename:         'C:\\Users\\Alfredo\\TestCafeStudio\\Examples\\js-examples.js',
                lineNum:          13,
                callsiteFrameIdx: 0,
                stackFrames:      [],
                isV8Frames:       false
            },
            errMsg:      'Error: In Before',
            originError: `Error: In Before
                at C:\Users\Rb3As\TestCafeStudio\Examples\js-examples.js:14:11
                at Generator.next (<anonymous>)
                at step (C:\Users\Rb3As\AppData\Roaming\npm\node_modules\testcafe\node_modules\babel-runtime\helpers\asyncToGenerator.js:17:30)
                at C:\Users\Rb3As\AppData\Roaming\npm\node_modules\testcafe\node_modules\babel-runtime\helpers\asyncToGenerator.js:35:14
                at new Promise (<anonymous>)
                at new F (C:\Users\Rb3As\AppData\Roaming\npm\node_modules\testcafe\node_modules\core-js\library\modules\_export.js:36:28)
                at C:\Users\Rb3As\AppData\Roaming\npm\node_modules\testcafe\node_modules\babel-runtime\helpers\asyncToGenerator.js:14:12
                at C:\Users\Rb3As\TestCafeStudio\Examples\js-examples.js:12:1
                at $$testcafe_test_run$$Xsa6hZIR5$$ (eval at addTrackingMarkerToFunction (C:\Users\Rb3As\AppData\Roaming\npm\node_modules\testcafe\src\api\test-run-tracker.js:76:16), <anonymous>:7:39)
                at C:\Users\Rb3As\AppData\Roaming\npm\node_modules\testcafe\src\api\wrap-test-function.js:17:28`
        }, {
            screenshotPath: '',
            testRunId:      TEST_RUN_ID_2,
            testRunPhase:   TestPhase.inTestBeforeHook,
            userAgent:      CHROME.prettyUserAgent
        }),
        new TestRunErrorFormattableAdapter({
            id:              'third_party_error',
            userAgent:       CHROME.prettyUserAgent,
            screenshotPath:  '',
            testRunId:       TEST_RUN_ID_2,
            testRunPhase:    TestPhase.inTestBeforeHook,
            code:            'E2',
            isTestCafeError: true,
            callsite:        {
                filename:         'C:\\Users\\Alfredo\\TestCafeStudio\\Examples\\js-examples.js',
                lineNum:          13,
                callsiteFrameIdx: 0,
                stackFrames:      [],
                isV8Frames:       false
            },
            errMsg:      'Error: In Before - third party error 2',
            originError: `Error: In Before
                at C:\Users\Rb3As\TestCafeStudio\Examples\js-examples.js:14:11
                at Generator.next (<anonymous>)
                at step (C:\Users\Rb3As\AppData\Roaming\npm\node_modules\testcafe\node_modules\babel-runtime\helpers\asyncToGenerator.js:17:30)
                at C:\Users\Rb3As\AppData\Roaming\npm\node_modules\testcafe\node_modules\babel-runtime\helpers\asyncToGenerator.js:35:14
                at new Promise (<anonymous>)
                at new F (C:\Users\Rb3As\AppData\Roaming\npm\node_modules\testcafe\node_modules\core-js\library\modules\_export.js:36:28)
                at C:\Users\Rb3As\AppData\Roaming\npm\node_modules\testcafe\node_modules\babel-runtime\helpers\asyncToGenerator.js:14:12
                at C:\Users\Rb3As\TestCafeStudio\Examples\js-examples.js:12:1
                at $$testcafe_test_run$$Xsa6hZIR5$$ (eval at addTrackingMarkerToFunction (C:\Users\Rb3As\AppData\Roaming\npm\node_modules\testcafe\src\api\test-run-tracker.js:76:16), <anonymous>:7:39)
                at C:\Users\Rb3As\AppData\Roaming\npm\node_modules\testcafe\src\api\wrap-test-function.js:17:28`
        }, {
            screenshotPath: '',
            testRunId:      TEST_RUN_ID_2,
            testRunPhase:   TestPhase.inTestBeforeHook,
            userAgent:      CHROME.prettyUserAgent
        })
    ],

    quarantine:     null,
    screenshotPath: null,
    screenshots:    [],
    skipped:        false,
    testId:         testId2,
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

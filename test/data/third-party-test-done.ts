import { TestRunErrorFormattableAdapter } from 'testcafe/lib/embedding-utils';

export const thirdPartyTestDone = {
    errs: [
        new TestRunErrorFormattableAdapter(
            {
                userAgent:       'Chrome 81.0.4044.122 / Windows 10',
                screenshotPath:  '',
                testRunId:       'Xsa6hZIR5',
                testRunPhase:    'inTestBeforeHook',
                code:            'E2',
                isTestCafeError: true,
                callsite:        {
                    filename:         'C:\\Users\\Alfredo\\TestCafeStudio\\Examples\\js-examples.js',
                    lineNum:          13,
                    callsiteFrameIdx: 0,
                    stackFrames:      [
                        [Object], [Object],
                        [Object], [Object],
                        [Object], [Object],
                        [Object], [Object]
                    ],
                    isV8Frames: false
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
            },
            {
                userAgent: 'chrome',
                testRunId: '1'
            }
        ),
        {
            'userAgent':       'Chrome 80.0.3987.132 / Windows 10',
            'screenshotPath':  '',
            'testRunPhase':    'inTest',
            'code':            'E24',
            'isTestCafeError': true,
            'callsite':        { 'filename': 'c:\\Projects\\testcafe-reporter-dashboard\\sandbox\\test.ts', 'lineNum': 7, 'callsiteFrameIdx': 6, 'stackFrames': [{}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}], 'isV8Frames': true },
            'apiFnChain':      ["Selector('#developer-name1')"],
            'apiFnIndex':      0,
            testRunId:         '2'
        }
    ],

    screenshots: [],
    videos:      []
};

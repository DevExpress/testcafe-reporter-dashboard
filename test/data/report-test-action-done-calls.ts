import { TestRunErrorFormattableAdapter } from 'testcafe/lib/embedding-utils';
import { TestCafeActionInfo } from '../../src/types/internal';
import { CommandType, TestPhase } from '../../src/types/testcafe';
import { FIREFOX, CHROME, CHROME_HEADLESS } from './test-browser-info';

export const reportTestActionDoneCalls: { apiActionName: string; actionInfo: TestCafeActionInfo }[] = [
    {
        apiActionName: 'click',
        actionInfo:    {
            browser: FIREFOX,
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
                id:    'test_1'
            },
            testRunId: 'firefox_1'
        }
    },
    {
        apiActionName: 'typeText',
        actionInfo:    {
            browser: FIREFOX,
            command: {
                type:     CommandType.typeText,
                selector: 'Selector(\'#developer-name\')',
                text:     'Peter',
            },
            test: {
                name:  'Test 1',
                phase: TestPhase.inTest,
                id:    'test_1'
            },
            testRunId: 'firefox_1'
        }
    },
    {
        apiActionName: 'eql',
        actionInfo:    {
            browser: FIREFOX,
            command: {
                type:          CommandType.assertion,
                assertionType: 'eql',
                actual:        'Peter',
                expected:      'Peter1',
                message:       null,
            },
            err: new TestRunErrorFormattableAdapter(
                {
                    callsite: {
                        callsiteFrameIdx: 6,
                        filename:         'file_1',
                        isV8Frames:	      true,
                        lineNum:          9,
                        stackFrames:      [],
                    },
                    code:            'E53',
                    errMsg:	         'AssertionError: expected \'Peter\' to deeply equal \'Peter1\'',
                    isTestCafeError: true,
                    screenshotPath:	 '',
                    testRunId:	      'firefox_1',
                    testRunPhase:    TestPhase.inTest,
                    userAgent:       FIREFOX.prettyUserAgent
                },
                {
                    screenshotPath:	'',
                    testRunId:	     'firefox_1',
                    testRunPhase:   TestPhase.inTest,
                    userAgent:      FIREFOX.prettyUserAgent
                }
            ),
            test: {
                name:  'Test 1',
                phase: TestPhase.inTest,
                id:    'test_1'
            },
            testRunId: 'firefox_1',
        }
    },
    {
        apiActionName: 'match',
        actionInfo:    {
            browser: FIREFOX,
            command: {
                type:          CommandType.assertion,
                assertionType: 'match',
                actual:        'foobar',
                expected:      new RegExp('/^f/'),
                message:       'this is regex test',
            },

            test: {
                name:  'Test 1',
                phase: TestPhase.inTest,
                id:    'test_1'
            },
            testRunId: 'firefox_1',
        }
    },
    {
        apiActionName: 'click',
        actionInfo:    {
            browser: CHROME,
            command: {
                options: {
                    speed:     0.5,
                    modifiers: { ctrl: true }
                },
                type:     CommandType.click,
                selector: 'Selector(\'#developer-name\')',
            },
            test: {
                name:  'Test 1',
                phase: TestPhase.inTest,
                id:    'test_1'
            },
            testRunId: 'chrome_1'
        }
    },
    {
        apiActionName: 'typeText',
        actionInfo:    {
            browser: CHROME,
            command: {
                type:     CommandType.typeText,
                selector: 'Selector(\'#developer-name\')',
                text:     'Peter',
            },
            test: {
                name:  'Test 1',
                phase: TestPhase.inTest,
                id:    'test_1'
            },
            testRunId: 'chrome_1'
        }
    },
    {
        apiActionName: 'eql',
        actionInfo:    {
            browser: CHROME,
            command: {
                type:          CommandType.assertion,
                assertionType: 'eql',
                actual:        'Peter',
                expected:      'Peter1',
                message:       null,
            },
            err: new TestRunErrorFormattableAdapter(
                {
                    callsite: {
                        callsiteFrameIdx: 6,
                        filename:         'file_1',
                        isV8Frames:	      true,
                        lineNum:          9,
                        stackFrames:      [],
                    },
                    code:            'E53',
                    errMsg:	         'AssertionError: expected \'Peter\' to deeply equal \'Peter1\'',
                    isTestCafeError: true,
                    screenshotPath:	 '',
                    testRunId:	      'chrome_1',
                    testRunPhase:    TestPhase.inTest,
                    userAgent:       CHROME.prettyUserAgent
                },
                {
                    screenshotPath:	'',
                    testRunId:	     'chrome_1',
                    testRunPhase:   TestPhase.inTest,
                    userAgent:      CHROME.prettyUserAgent
                }
            ),
            test: {
                name:  'Test 1',
                phase: TestPhase.inTest,
                id:    'test_1'
            },
            testRunId: 'chrome_1',
        }
    },
    {
        apiActionName: 'match',
        actionInfo:    {
            browser: CHROME,
            command: {
                type:          CommandType.assertion,
                assertionType: 'match',
                actual:        'foobar',
                expected:      new RegExp('/^f/'),
                message:       'this is regex test',
            },

            test: {
                name:  'Test 1',
                phase: TestPhase.inTest,
                id:    'test_1'
            },
            testRunId: 'chrome_1',
        }
    },

    {
        apiActionName: 'click',
        actionInfo:    {
            browser: CHROME_HEADLESS,
            command: {
                options: {
                    speed:     0.5,
                    modifiers: { ctrl: true }
                },
                type:     CommandType.click,
                selector: 'Selector(\'#developer-name\')',
            },
            test: {
                name:  'Test 1',
                phase: TestPhase.inTest,
                id:    'test_1'
            },
            testRunId: 'chrome_headless'
        }
    },
    {
        apiActionName: 'typeText',
        actionInfo:    {
            browser: CHROME_HEADLESS,
            command: {
                type:     CommandType.typeText,
                selector: 'Selector(\'#developer-name\')',
                text:     'Peter',
            },
            test: {
                name:  'Test 1',
                phase: TestPhase.inTest,
                id:    'test_1'
            },
            testRunId: 'chrome_headless'
        }
    },
    {
        apiActionName: 'eql',
        actionInfo:    {
            browser: CHROME_HEADLESS,
            command: {
                type:          CommandType.assertion,
                assertionType: 'eql',
                actual:        'Peter',
                expected:      'Peter1',
                message:       null,
            },
            err: new TestRunErrorFormattableAdapter(
                {
                    callsite: {
                        callsiteFrameIdx: 6,
                        filename:         'file_1',
                        isV8Frames:	      true,
                        lineNum:          9,
                        stackFrames:      [],
                    },
                    code:            'E53',
                    errMsg:	         'AssertionError: expected \'Peter\' to deeply equal \'Peter1\'',
                    isTestCafeError: true,
                    screenshotPath:	 '',
                    testRunId:	      'chrome_headless',
                    testRunPhase:    TestPhase.inTest,
                    userAgent:       CHROME.prettyUserAgent
                },
                {
                    screenshotPath:	'',
                    testRunId:	     'chrome_headless',
                    testRunPhase:   TestPhase.inTest,
                    userAgent:      CHROME.prettyUserAgent
                }
            ),
            test: {
                name:  'Test 1',
                phase: TestPhase.inTest,
                id:    'test_1'
            },
            testRunId: 'chrome_headless',
        }
    },
    {
        apiActionName: 'match',
        actionInfo:    {
            browser: CHROME_HEADLESS,
            command: {
                type:          CommandType.assertion,
                assertionType: 'match',
                actual:        'foobar',
                expected:      new RegExp('/^f/'),
                message:       'this is regex test',
            },

            test: {
                name:  'Test 1',
                phase: TestPhase.inTest,
                id:    'test_1'
            },
            testRunId: 'chrome_headless',
        }
    }
];

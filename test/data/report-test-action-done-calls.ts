export const reportTestActionDoneCalls = [
    {
        'apiActionName': 'click',
        'actionInfo':    {
            'test': {
                'name':  'Test 1',
                'phase': 'inTest'
            },
            'command': {
                'type':     'click',
                'selector': "Selector('#developer-name')",
                'options':  {
                    'speed':     0.5,
                    'offsetX':   null,
                    'offsetY':   null,
                    'modifiers': {
                        'ctrl':  true,
                        'alt':   false,
                        'shift': false,
                        'meta':  false
                    },
                    'caretPos': null
                }
            },
            'browser': {
                'name':     'Firefox',
                'version':  '59.0',
                'platform': 'desktop',
                'os':       {
                    'name':    'Windows',
                    'version': '8.1'
                },
                'engine': {
                    'name':    'Gecko',
                    'version': '20100101'
                },
                'prettyUserAgent': 'Firefox 59.0 / Windows 8.1',
                'userAgent':       'Mozilla/5.0 (Windows NT 6.3; Win64; x64; rv:59.0) Gecko/20100101 Firefox/59.0',
                'alias':           'firefox',
                'headless':        false
            }
        }
    },
    {
        'apiActionName': 'typeText',
        'actionInfo':    {
            'test': {
                'name':  'Test 1',
                'phase': 'inTest'
            },
            'command': {
                'type':     'type-text',
                'selector': "Selector('#developer-name')",
                'text':     'Peter',
                'options':  {
                    'speed':     null,
                    'offsetX':   null,
                    'offsetY':   null,
                    'modifiers': {
                        'ctrl':  false,
                        'alt':   false,
                        'shift': false,
                        'meta':  false
                    },
                    'caretPos': null,
                    'replace':  false,
                    'paste':    false
                }
            },
            'browser': {
                'name':     'Firefox',
                'version':  '59.0',
                'platform': 'desktop',
                'os':       {
                    'name':    'Windows',
                    'version': '8.1'
                },
                'engine': {
                    'name':    'Gecko',
                    'version': '20100101'
                },
                'prettyUserAgent': 'Firefox 59.0 / Windows 8.1',
                'userAgent':       'Mozilla/5.0 (Windows NT 6.3; Win64; x64; rv:59.0) Gecko/20100101 Firefox/59.0',
                'alias':           'firefox',
                'headless':        false
            }
        }
    },
    {
        'apiActionName': 'click',
        'actionInfo':    {
            'test': {
                'name':  'Test 1',
                'phase': 'inTest'
            },
            'command': {
                'type':     'click',
                'selector': "Selector('#tried-test-cafe')",
                'options':  {
                    'speed':     null,
                    'offsetX':   null,
                    'offsetY':   null,
                    'modifiers': {
                        'ctrl':  false,
                        'alt':   false,
                        'shift': false,
                        'meta':  false
                    },
                    'caretPos': null
                }
            },
            'browser': {
                'name':     'Firefox',
                'version':  '59.0',
                'platform': 'desktop',
                'os':       {
                    'name':    'Windows',
                    'version': '8.1'
                },
                'engine': {
                    'name':    'Gecko',
                    'version': '20100101'
                },
                'prettyUserAgent': 'Firefox 59.0 / Windows 8.1',
                'userAgent':       'Mozilla/5.0 (Windows NT 6.3; Win64; x64; rv:59.0) Gecko/20100101 Firefox/59.0',
                'alias':           'firefox',
                'headless':        false
            }
        }
    },
    {
        'apiActionName': 'drag',
        'actionInfo':    {
            'test': {
                'name':  'Test 1',
                'phase': 'inTest'
            },
            'command': {
                'type':        'drag',
                'selector':    "Selector('.ui-slider-handle.ui-corner-all.ui-state-default')",
                'dragOffsetX': 94,
                'dragOffsetY': -2,
                'options':     {
                    'speed':     null,
                    'offsetX':   8,
                    'offsetY':   12,
                    'modifiers': {
                        'ctrl':  false,
                        'alt':   false,
                        'shift': false,
                        'meta':  false
                    }
                }
            },
            'browser': {
                'name':     'Firefox',
                'version':  '59.0',
                'platform': 'desktop',
                'os':       {
                    'name':    'Windows',
                    'version': '8.1'
                },
                'engine': {
                    'name':    'Gecko',
                    'version': '20100101'
                },
                'prettyUserAgent': 'Firefox 59.0 / Windows 8.1',
                'userAgent':       'Mozilla/5.0 (Windows NT 6.3; Win64; x64; rv:59.0) Gecko/20100101 Firefox/59.0',
                'alias':           'firefox',
                'headless':        false
            }
        }
    },
    {
        'apiActionName': 'click',
        'actionInfo':    {
            'test': {
                'name':  'Test 1',
                'phase': 'inTest'
            },
            'command': {
                'type':     'click',
                'selector': "Selector('#developer-name')",
                'options':  {
                    'speed':     0.5,
                    'offsetX':   null,
                    'offsetY':   null,
                    'modifiers': {
                        'ctrl':  true,
                        'alt':   false,
                        'shift': false,
                        'meta':  false
                    },
                    'caretPos': null
                }
            },
            'browser': {
                'name':     'Chrome',
                'version':  '79.0.3945.130',
                'platform': 'desktop',
                'os':       {
                    'name':    'Windows',
                    'version': '8.1'
                },
                'engine': {
                    'name':    'Blink',
                    'version': '0.0'
                },
                'prettyUserAgent': 'Chrome 79.0.3945.130 / Windows 8.1',
                'userAgent':       'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/79.0.3945.130 Safari/537.36',
                'alias':           'chrome:headless',
                'headless':        true
            }
        }
    },
    {
        'apiActionName': 'typeText',
        'actionInfo':    {
            'test': {
                'name':  'Test 1',
                'phase': 'inTest'
            },
            'command': {
                'type':     'type-text',
                'selector': "Selector('#developer-name')",
                'text':     'Peter',
                'options':  {
                    'speed':     null,
                    'offsetX':   null,
                    'offsetY':   null,
                    'modifiers': {
                        'ctrl':  false,
                        'alt':   false,
                        'shift': false,
                        'meta':  false
                    },
                    'caretPos': null,
                    'replace':  false,
                    'paste':    false
                }
            },
            'browser': {
                'name':     'Chrome',
                'version':  '79.0.3945.130',
                'platform': 'desktop',
                'os':       {
                    'name':    'Windows',
                    'version': '8.1'
                },
                'engine': {
                    'name':    'Blink',
                    'version': '0.0'
                },
                'prettyUserAgent': 'Chrome 79.0.3945.130 / Windows 8.1',
                'userAgent':       'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/79.0.3945.130 Safari/537.36',
                'alias':           'chrome:headless',
                'headless':        true
            }
        }
    },
    {
        'apiActionName': 'click',
        'actionInfo':    {
            'test': {
                'name':  'Test 1',
                'phase': 'inTest'
            },
            'command': {
                'type':     'click',
                'selector': "Selector('#tried-test-cafe')",
                'options':  {
                    'speed':     null,
                    'offsetX':   null,
                    'offsetY':   null,
                    'modifiers': {
                        'ctrl':  false,
                        'alt':   false,
                        'shift': false,
                        'meta':  false
                    },
                    'caretPos': null
                }
            },
            'browser': {
                'name':     'Chrome',
                'version':  '79.0.3945.130',
                'platform': 'desktop',
                'os':       {
                    'name':    'Windows',
                    'version': '8.1'
                },
                'engine': {
                    'name':    'Blink',
                    'version': '0.0'
                },
                'prettyUserAgent': 'Chrome 79.0.3945.130 / Windows 8.1',
                'userAgent':       'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/79.0.3945.130 Safari/537.36',
                'alias':           'chrome:headless',
                'headless':        true
            }
        }
    },
    {
        'apiActionName': 'drag',
        'actionInfo':    {
            'test': {
                'name':  'Test 1',
                'phase': 'inTest'
            },
            'command': {
                'type':        'drag',
                'selector':    "Selector('.ui-slider-handle.ui-corner-all.ui-state-default')",
                'dragOffsetX': 94,
                'dragOffsetY': -2,
                'options':     {
                    'speed':     null,
                    'offsetX':   8,
                    'offsetY':   12,
                    'modifiers': {
                        'ctrl':  false,
                        'alt':   false,
                        'shift': false,
                        'meta':  false
                    }
                }
            },
            'browser': {
                'name':     'Chrome',
                'version':  '79.0.3945.130',
                'platform': 'desktop',
                'os':       {
                    'name':    'Windows',
                    'version': '8.1'
                },
                'engine': {
                    'name':    'Blink',
                    'version': '0.0'
                },
                'prettyUserAgent': 'Chrome 79.0.3945.130 / Windows 8.1',
                'userAgent':       'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/79.0.3945.130 Safari/537.36',
                'alias':           'chrome:headless',
                'headless':        true
            }
        }
    },
    {
        'apiActionName': 'click',
        'actionInfo':    {
            'test': {
                'name':  'Test 1',
                'phase': 'inTest'
            },
            'command': {
                'type':     'click',
                'selector': "Selector('#developer-name')",
                'options':  {
                    'speed':     0.5,
                    'offsetX':   null,
                    'offsetY':   null,
                    'modifiers': {
                        'ctrl':  true,
                        'alt':   false,
                        'shift': false,
                        'meta':  false
                    },
                    'caretPos': null
                }
            },
            'browser': {
                'name':     'Chrome',
                'version':  '79.0.3945.130',
                'platform': 'desktop',
                'os':       {
                    'name':    'Windows',
                    'version': '8.1'
                },
                'engine': {
                    'name':    'Blink',
                    'version': '0.0'
                },
                'prettyUserAgent': 'Chrome 79.0.3945.130 / Windows 8.1',
                'userAgent':       'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36',
                'alias':           'chrome',
                'headless':        false
            }
        }
    },
    {
        'apiActionName': 'typeText',
        'actionInfo':    {
            'test': {
                'name':  'Test 1',
                'phase': 'inTest'
            },
            'command': {
                'type':     'type-text',
                'selector': "Selector('#developer-name')",
                'text':     'Peter',
                'options':  {
                    'speed':     null,
                    'offsetX':   null,
                    'offsetY':   null,
                    'modifiers': {
                        'ctrl':  false,
                        'alt':   false,
                        'shift': false,
                        'meta':  false
                    },
                    'caretPos': null,
                    'replace':  false,
                    'paste':    false
                }
            },
            'browser': {
                'name':     'Chrome',
                'version':  '79.0.3945.130',
                'platform': 'desktop',
                'os':       {
                    'name':    'Windows',
                    'version': '8.1'
                },
                'engine': {
                    'name':    'Blink',
                    'version': '0.0'
                },
                'prettyUserAgent': 'Chrome 79.0.3945.130 / Windows 8.1',
                'userAgent':       'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36',
                'alias':           'chrome',
                'headless':        false
            }
        }
    },
    {
        'apiActionName': 'click',
        'actionInfo':    {
            'test': {
                'name':  'Test 1',
                'phase': 'inTest'
            },
            'command': {
                'type':     'click',
                'selector': "Selector('#tried-test-cafe')",
                'options':  {
                    'speed':     null,
                    'offsetX':   null,
                    'offsetY':   null,
                    'modifiers': {
                        'ctrl':  false,
                        'alt':   false,
                        'shift': false,
                        'meta':  false
                    },
                    'caretPos': null
                }
            },
            'browser': {
                'name':     'Chrome',
                'version':  '79.0.3945.130',
                'platform': 'desktop',
                'os':       {
                    'name':    'Windows',
                    'version': '8.1'
                },
                'engine': {
                    'name':    'Blink',
                    'version': '0.0'
                },
                'prettyUserAgent': 'Chrome 79.0.3945.130 / Windows 8.1',
                'userAgent':       'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36',
                'alias':           'chrome',
                'headless':        false
            }
        }
    },
    {
        'apiActionName': 'drag',
        'actionInfo':    {
            'test': {
                'name':  'Test 1',
                'phase': 'inTest'
            },
            'command': {
                'type':        'drag',
                'selector':    "Selector('.ui-slider-handle.ui-corner-all.ui-state-default')",
                'dragOffsetX': 94,
                'dragOffsetY': -2,
                'options':     {
                    'speed':     null,
                    'offsetX':   8,
                    'offsetY':   12,
                    'modifiers': {
                        'ctrl':  false,
                        'alt':   false,
                        'shift': false,
                        'meta':  false
                    }
                }
            },
            'browser': {
                'name':     'Chrome',
                'version':  '79.0.3945.130',
                'platform': 'desktop',
                'os':       {
                    'name':    'Windows',
                    'version': '8.1'
                },
                'engine': {
                    'name':    'Blink',
                    'version': '0.0'
                },
                'prettyUserAgent': 'Chrome 79.0.3945.130 / Windows 8.1',
                'userAgent':       'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36',
                'alias':           'chrome',
                'headless':        false
            }
        }
    },
    {
        'apiActionName': 'eql',
        'actionInfo':    {
            'errors': [
                {
                    'code':            'E53',
                    'isTestCafeError': true,
                    'callsite':        {
                        'filename':         'C:\\testcafe-reporter-dashboard\\sandbox\\test.js',
                        'lineNum':          14,
                        'callsiteFrameIdx': 6,
                        'stackFrames':      [
                            {},
                            {},
                            {},
                            {},
                            {},
                            {},
                            {},
                            {},
                            {},
                            {},
                            {},
                            {},
                            {},
                            {},
                            {},
                            {},
                            {},
                            {},
                            {}
                        ],
                        'isV8Frames': true
                    },
                    'errMsg': "AssertionError: expected 'Peter' to deeply equal 'Peter1'"
                }
            ],
            'test': {
                'name':  'Test 1',
                'phase': 'inTest'
            },
            'command': {
                'type':          'assertion',
                'assertionType': 'eql',
                'actual':        'Peter',
                'expected':      'Peter1',
                'message':       null,
                'options':       {
                    'allowUnawaitedPromise': false
                }
            },
            'browser': {
                'name':     'Firefox',
                'version':  '59.0',
                'platform': 'desktop',
                'os':       {
                    'name':    'Windows',
                    'version': '8.1'
                },
                'engine': {
                    'name':    'Gecko',
                    'version': '20100101'
                },
                'prettyUserAgent': 'Firefox 59.0 / Windows 8.1',
                'userAgent':       'Mozilla/5.0 (Windows NT 6.3; Win64; x64; rv:59.0) Gecko/20100101 Firefox/59.0',
                'alias':           'firefox',
                'headless':        false
            }
        }
    },
    {
        'apiActionName': 'eql',
        'actionInfo':    {
            'errors': [
                {
                    'code':            'E53',
                    'isTestCafeError': true,
                    'callsite':        {
                        'filename':         'C:\\testcafe-reporter-dashboard\\sandbox\\test.js',
                        'lineNum':          14,
                        'callsiteFrameIdx': 6,
                        'stackFrames':      [
                            {},
                            {},
                            {},
                            {},
                            {},
                            {},
                            {},
                            {},
                            {},
                            {},
                            {},
                            {},
                            {},
                            {},
                            {},
                            {},
                            {},
                            {},
                            {}
                        ],
                        'isV8Frames': true
                    },
                    'errMsg': "AssertionError: expected 'Peter' to deeply equal 'Peter1'"
                }
            ],
            'test': {
                'name':  'Test 1',
                'phase': 'inTest'
            },
            'command': {
                'type':          'assertion',
                'assertionType': 'eql',
                'actual':        'Peter',
                'expected':      'Peter1',
                'message':       null,
                'options':       {
                    'allowUnawaitedPromise': false
                }
            },
            'browser': {
                'name':     'Chrome',
                'version':  '79.0.3945.130',
                'platform': 'desktop',
                'os':       {
                    'name':    'Windows',
                    'version': '8.1'
                },
                'engine': {
                    'name':    'Blink',
                    'version': '0.0'
                },
                'prettyUserAgent': 'Chrome 79.0.3945.130 / Windows 8.1',
                'userAgent':       'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/79.0.3945.130 Safari/537.36',
                'alias':           'chrome:headless',
                'headless':        true
            }
        }
    },
    {
        'apiActionName': 'eql',
        'actionInfo':    {
            'errors': [
                {
                    'code':            'E53',
                    'isTestCafeError': true,
                    'callsite':        {
                        'filename':         'C:\\testcafe-reporter-dashboard\\sandbox\\test.js',
                        'lineNum':          14,
                        'callsiteFrameIdx': 6,
                        'stackFrames':      [
                            {},
                            {},
                            {},
                            {},
                            {},
                            {},
                            {},
                            {},
                            {},
                            {},
                            {},
                            {},
                            {},
                            {},
                            {},
                            {},
                            {},
                            {},
                            {},
                            {}
                        ],
                        'isV8Frames': true
                    },
                    'errMsg': "AssertionError: expected 'Peter' to deeply equal 'Peter1'"
                }
            ],
            'test': {
                'name':  'Test 1',
                'phase': 'inTest'
            },
            'command': {
                'type':          'assertion',
                'assertionType': 'eql',
                'actual':        'Peter',
                'expected':      'Peter1',
                'message':       null,
                'options':       {
                    'allowUnawaitedPromise': false
                }
            },
            'browser': {
                'name':     'Chrome',
                'version':  '79.0.3945.130',
                'platform': 'desktop',
                'os':       {
                    'name':    'Windows',
                    'version': '8.1'
                },
                'engine': {
                    'name':    'Blink',
                    'version': '0.0'
                },
                'prettyUserAgent': 'Chrome 79.0.3945.130 / Windows 8.1',
                'userAgent':       'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36',
                'alias':           'chrome',
                'headless':        false
            }
        }
    }
];

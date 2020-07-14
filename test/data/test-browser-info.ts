import { BrowserInfo } from '../../src/types/testcafe';

export const CHROME_HEADLESS: BrowserInfo = {
    alias:           'chrome:headless',
    engine:          { name: 'Blink', version: '0.0' },
    headless:        true,
    name:            'Chrome',
    os:              { name: 'Windows', version: '8.1' },
    platform:        'desktop',
    prettyUserAgent: 'Chrome 79.0.3945.130 / Windows 8.1',
    userAgent:       'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/79.0.3945.130 Safari/537.36',
    version:         '79.0.3945.130'
};

export const CHROME: BrowserInfo = {
    alias:           'chrome',
    engine:          { name: 'Blink', version: '0.0' },
    headless:        false,
    name:            'Chrome',
    os:              { name: 'Windows', version: '8.1' },
    platform:        'desktop',
    prettyUserAgent: 'Chrome 79.0.3945.130 / Windows 8.1',
    userAgent:       'Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/79.0.3945.130 Safari/537.36',
    version:         '79.0.3945.130'
};

export const FIREFOX: BrowserInfo = {
    alias:           'firefox',
    engine:          { name: 'Gecko', version: '20100101' },
    headless:        false,
    name:            'Firefox',
    os:              { name: 'Windows', version: '8.1' },
    platform:        'desktop',
    prettyUserAgent: 'Firefox 59.0 / Windows 8.1',
    userAgent:       'Mozilla/5.0 (Windows NT 6.3; Win64; x64; rv:59.0) Gecko/20100101 Firefox/59.0',
    version:         '59.0'
};

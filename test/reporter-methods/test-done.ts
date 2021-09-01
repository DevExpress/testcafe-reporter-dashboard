import assert from 'assert';
import { buildReporterPlugin } from 'testcafe/lib/embedding-utils';

import { AggregateCommandType, DashboardSettings } from '../../src/types/internal/dashboard';
import { CHROME } from './../data/test-browser-info';
import { thirdPartyTestDone, skippedTestDone } from './../data';
import { testActionInfos, quarantineTestDoneInfo } from '../data/test-quarantine-mode-info';
import reporterObjectFactory from '../../src/reporter-object-factory';
import logger from '../../src/logger';
import { DashboardTestRunInfo, TestDoneArgs } from '../../src/types';
import { mockReadFile } from '../mocks';
import { TC_OLDEST_COMPATIBLE_VERSION } from '../../src/validate-settings';

const TESTCAFE_DASHBOARD_URL      = 'http://localhost';
const AUTHENTICATION_TOKEN        = 'authentication_token';
const SETTINGS: DashboardSettings = {
    authenticationToken: AUTHENTICATION_TOKEN,
    buildId:             void 0,
    dashboardUrl:        TESTCAFE_DASHBOARD_URL,
    isLogEnabled:        false,
    noScreenshotUpload:  false,
    noVideoUpload:       false,
    responseTimeout:     1000,
    requestRetryCount:   10
};

describe('reportTestDone', () => {
    let testRunInfo           = {} as DashboardTestRunInfo;
    let uploadPaths: string[] = [];

    function fetchRunInfoMock (url: string, request) {
        const response  = { ok: true, status: 200, statusText: 'OK' } as Response;
        const uploadUrl = 'upload_url';

        if (url === `${TESTCAFE_DASHBOARD_URL}/api/getUploadUrl`)
            response.json = () => Promise.resolve({ uploadId: 'upload_id', uploadUrl });
        else if (url.startsWith(uploadUrl)) {
            const body = request.body.toString();

            if (body.startsWith('%filePath%'))
                uploadPaths.push(body);
            else
                testRunInfo = JSON.parse(request.body.toString());
        }

        return Promise.resolve(response as unknown as Response);
    }

    beforeEach(() => {
        testRunInfo = {} as DashboardTestRunInfo;
        uploadPaths = [];
    });

    it('Should process errors originated not from actions', async () => {
        const reporter = buildReporterPlugin(() => reporterObjectFactory(
                mockReadFile, fetchRunInfoMock, SETTINGS, logger, TC_OLDEST_COMPATIBLE_VERSION
            ), process.stdout
        );

        await reporter.reportTestDone('Test 1', thirdPartyTestDone);

        // console.log(testRunInfo.browserRuns);

        const { thirdPartyError, actions, browser } = testRunInfo.browserRuns[thirdPartyTestDone.browsers[0].testRunId];

        assert.ok(thirdPartyError);
        assert.deepEqual(actions, void 0);
        assert.ok(browser);
        assert.equal(browser.alias, CHROME.alias);
        assert.equal(browser.name, CHROME.name);
        assert.equal(browser.prettyUserAgent, thirdPartyTestDone.errs[0].userAgent);
        assert.ok(browser.version);
        assert.ok(browser.os);
        assert.ok(browser.os.name);
        assert.ok(browser.os.version);
    });

    it('Should send skipped prop in test done command', async () => {
        let testDonePayload = null as unknown as TestDoneArgs;

        function fetchMock (url: string, request) {
            const response  = { ok: true, status: 200, statusText: 'OK', json: () => Promise.resolve('') };

            if (url.startsWith(`${TESTCAFE_DASHBOARD_URL}/api/commands`)) {
                const { type, payload } = JSON.parse(request.body);

                if (type === AggregateCommandType.reportTestDone)
                    testDonePayload = payload;
            }

            return Promise.resolve(response as Response);
        }

        const reporter = buildReporterPlugin(() => reporterObjectFactory(
                mockReadFile, fetchMock, SETTINGS, logger, TC_OLDEST_COMPATIBLE_VERSION
            ), process.stdout);

        await reporter.reportTestDone('Test 1', skippedTestDone);

        assert.ok(testDonePayload);
        assert.ok(testDonePayload.skipped);
    });

    it('should collect quarantine attempts info', async () => {
        const readFile = (path: string) => Promise.resolve(Buffer.from(path));

        const reporter = buildReporterPlugin(() => reporterObjectFactory(
                readFile, fetchRunInfoMock, SETTINGS, logger, TC_OLDEST_COMPATIBLE_VERSION
            ), process.stdout
        );

        for (const actionInfo of testActionInfos)
            await reporter.reportTestActionDone('click', actionInfo);

        await reporter.reportTestDone('Test 1', quarantineTestDoneInfo);

        const { browserRuns } = testRunInfo;

        assert.equal(browserRuns.firefox_1.browser.alias, 'firefox');
        assert.equal(browserRuns.chrome_1.browser.alias, 'chrome');
        assert.equal(browserRuns.chrome_1_1.browser.alias, 'chrome');
        assert.equal(browserRuns.chrome_headless.browser.alias, 'chrome:headless');
        assert.equal(browserRuns.chrome_headless.browser.alias, 'chrome:headless');
        assert.equal(browserRuns.chrome_headless.browser.alias, 'chrome:headless');
        assert.equal(uploadPaths.length, 9);

        for (const runInfo of Object.values(browserRuns)) {
            assert.deepEqual(runInfo.screenshotUploadIds, ['upload_id']);
            assert.deepEqual(runInfo.videoUploadIds, ['upload_id']);
        }
    });
});

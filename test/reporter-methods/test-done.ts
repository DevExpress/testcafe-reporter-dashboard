import assert from 'assert';
import { buildReporterPlugin } from 'testcafe/lib/embedding-utils';

import { AggregateCommandType, DashboardSettings } from '../../src/types/internal/dashboard';
import { CHROME } from './../data/test-browser-info';
import { thirdPartyTestDone, skippedTestDone } from './../data';
import reporterObjectFactory from '../../src/reporter-object-factory';
import logger from '../../src/logger';
import { DashboardTestRunInfo, TestDoneArgs } from '../../src/types';
import { mockReadFile } from '../mocks';

const TESTCAFE_DASHBOARD_URL      = 'http://localhost';
const AUTHENTICATION_TOKEN        = 'authentication_token';
const SETTINGS: DashboardSettings = {
    authenticationToken: AUTHENTICATION_TOKEN,
    buildId:             void 0,
    dashboardUrl:        TESTCAFE_DASHBOARD_URL,
    isLogEnabled:        false,
    noScreenshotUpload:  false,
    noVideoUpload:       false,
};

describe('reportTestDone', () => {
    it('Should process errors originated not from actions', async () => {
        let testRunInfo = {} as DashboardTestRunInfo;

        function fetchMock (url: string, request) {
            const response  = { ok: true, status: 200, statusText: 'OK' } as Response;
            const uploadUrl = 'upload_url';

            if (url.startsWith(`${TESTCAFE_DASHBOARD_URL}/api/uploader/getUploadUrl`))
                response.json = () => Promise.resolve({ uploadId: 'upload_id', uploadUrl });
            else if (url.startsWith(uploadUrl))
                testRunInfo = JSON.parse(request.body.toString());

            return Promise.resolve(response as unknown as Response);
        }

        const reporter = buildReporterPlugin(() => reporterObjectFactory(
            mockReadFile, fetchMock, SETTINGS, logger), process.stdout
        );

        await reporter.reportTestDone('Test 1', thirdPartyTestDone);

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

        const reporter = buildReporterPlugin(() => reporterObjectFactory(mockReadFile, fetchMock, SETTINGS, logger), process.stdout);

        await reporter.reportTestDone('Test 1', skippedTestDone);

        assert.ok(testDonePayload);
        assert.ok(testDonePayload.skipped);
    });
});

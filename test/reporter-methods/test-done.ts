import assert from 'assert';
import { sign } from 'jsonwebtoken';
import { buildReporterPlugin } from 'testcafe/lib/embedding-utils';

import { DashboardTestRunInfo, AggregateCommandType, DashboardSettings } from './../../src/types/dashboard';
import { CHROME } from './../data/test-browser-info';
import { thirdPartyTestDone, skippedTestDone } from './../data';
import reporterObjectFactory from '../../src/reporter-object-factory';
import logger from '../../src/logger';

const TESTCAFE_DASHBOARD_URL      = 'http://localhost';
const SETTINGS: DashboardSettings = {
    authenticationToken: sign({ projectId: 'mock_project_id' }, 'secret'),
    buildId:             '',
    dashboardUrl:        TESTCAFE_DASHBOARD_URL,
    isLogEnabled:        false,
    noScreenshotUpload:  false,
    noVideoUpload:       false
};

describe('reportTestDone', () => {
    it('Should process errors originated not from actions', async () => {
        let testRunInfo: DashboardTestRunInfo = null;

        function fetchMock (url: string, request) {
            const response  = { ok: true, status: 200, statusText: 'OK', json: null };
            const uploadUrl = 'upload_url';

            if (url.startsWith(`${TESTCAFE_DASHBOARD_URL}/api/uploader/getUploadUrl`))
                response.json = () => ({ uploadId: 'upload_id', uploadUrl });
            else if (url.startsWith(uploadUrl))
                testRunInfo = JSON.parse(request.body.toString());

            return Promise.resolve(response as Response);
        }
        const reporter = buildReporterPlugin(() => reporterObjectFactory(() => void 0, fetchMock, SETTINGS, logger), process.stdout);

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
        let testDonePayload = null;

        function fetchMock (url: string, request) {
            const response  = { ok: true, status: 200, statusText: 'OK', json: () => Promise.resolve('') };

            if (url.startsWith(`${TESTCAFE_DASHBOARD_URL}/api/commands`)) {
                const { type, payload } = JSON.parse(request.body);

                if (type === AggregateCommandType.reportTestDone)
                    testDonePayload = payload;
            }

            return Promise.resolve(response as Response);
        }

        const reporter = buildReporterPlugin(() => reporterObjectFactory(() => void 0, fetchMock, SETTINGS, logger), process.stdout);

        await reporter.reportTestDone('Test 1', skippedTestDone);

        assert.ok(testDonePayload);
        assert.ok(testDonePayload.skipped);
    });
});

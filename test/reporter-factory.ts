import assert from 'assert';
import { sign } from 'jsonwebtoken';
import { buildReporterPlugin, TestRunErrorFormattableAdapter } from 'testcafe/lib/embedding-utils';

import { DashboardTestRunInfo, AggregateCommandType, DashboardSettings } from './../src/types/dashboard';
import { reportTestActionDoneCalls } from './data/report-test-action-done-calls';
import { CHROME, FIREFOX, CHROME_HEADLESS } from './data/test-browser-info';
import { testDoneInfo, twoErrorsTestActionDone, thirdPartyTestDone, skippedTestDone } from './data/';
import reporterObjectFactory from '../src/reporter-object-factory';
import logger from '../src/logger';
import { AUTHENTICATION_TOKEN_NOT_DEFINED, createLongBuildIdError, DASHBOARD_LOCATION_NOT_DEFINED } from '../src/texts';
import BLANK_REPORTER from '../src/blank-reporter';

const TESTCAFE_DASHBOARD_URL      = 'http://localhost';
const AUTHENTICATION_TOKEN        = 'authentication_token';
const SETTINGS: DashboardSettings = {
    authenticationToken: AUTHENTICATION_TOKEN,
    buildId:             '',
    dashboardUrl:        TESTCAFE_DASHBOARD_URL,
    isLogEnabled:        false,
    noScreenshotUpload:  false,
    noVideoUpload:       false
};

describe('reportTaskStart', () => {
    const buildId = 'test_build_id/:?&"=;+$';

    async function assertReporterMessage (expected: string, settings: DashboardSettings): Promise<void> {
        const logs       = [];
        const loggerMock = {
            log:   message => logs.push(message),
            warn:  message => logs.push(message),
            error: message => logs.push(message)
        };

        function fetchMock () {
            return Promise.resolve({ ok: true, status: 200, statusText: 'OK' } as Response);
        };

        const reporter = reporterObjectFactory(() => void 0, fetchMock, settings, loggerMock);

        await reporter.reportTaskStart(new Date(), [], 1, []);

        assert.equal(logs.length, 1);
        assert.equal(logs[0], expected);
    }

    it('Show reporter URL message', async () => {
        const projectId = 'mock_project_id';
        const reportId  = 'mock_report_id';

        const authenticationToken = sign({ projectId }, 'secret');

        await assertReporterMessage(
            `Task execution report: ${TESTCAFE_DASHBOARD_URL}/runs/${projectId}/${reportId}`,
            { ...SETTINGS, authenticationToken, runId: reportId }
        );

        await assertReporterMessage(
            `Task execution report: ${TESTCAFE_DASHBOARD_URL}/runs/${projectId}/${encodeURIComponent(buildId)}`,
            { ...SETTINGS, authenticationToken, runId: reportId, buildId }
        );
    });

    it('Show build ID validation error', async () => {
        const errors      = [];
        const loggerMock  = { ...logger, error: message => errors.push(message) };
        const longBuildId = 'test_build_id/123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890';
        const reporter    = reporterObjectFactory(() => void 0, () => void 0, { ...SETTINGS, buildId: longBuildId }, loggerMock);

        assert.equal(errors.length, 1);
        assert.equal(errors[0], createLongBuildIdError(longBuildId));
        assert.equal(reporter, BLANK_REPORTER);
    });

    it('Show authentication token validation error', async () => {
        const errors      = [];
        const loggerMock  = { ...logger, error: message => errors.push(message) };
        const reporter    = reporterObjectFactory(() => void 0, () => void 0, { ...SETTINGS, authenticationToken: null }, loggerMock);

        assert.equal(errors.length, 1);
        assert.equal(errors[0], AUTHENTICATION_TOKEN_NOT_DEFINED);
        assert.equal(reporter, BLANK_REPORTER);
    });

    it('Show dashboard URL validation error', async () => {
        const errors      = [];
        const loggerMock  = { ...logger, error: message => errors.push(message) };
        const reporter    = reporterObjectFactory(() => void 0, () => void 0, { ...SETTINGS, dashboardUrl: null }, loggerMock);

        assert.equal(errors.length, 1);
        assert.equal(errors[0], DASHBOARD_LOCATION_NOT_DEFINED);
        assert.equal(reporter, BLANK_REPORTER);
    });
});

describe('reportTestActionDone', () => {
    function checkBrowserRun (browserRun, prettyUserAgent): void {
        const { browser, actions } = browserRun;

        assert.equal(browser.prettyUserAgent, prettyUserAgent);
        assert.equal(actions.length, 4);

        assert.equal(actions[0].apiName, 'click');
        assert.equal(actions[0].testPhase, 'inTest');
        assert.equal(actions[0].command.type, 'click');
        assert.equal(actions[0].command.selector, 'Selector(\'#developer-name\')');
        assert.equal(actions[0].command.options.speed, 0.5);
        assert.equal(actions[0].command.options.modifiers.ctrl, true);

        assert.equal(actions[1].apiName, 'typeText');
        assert.equal(actions[1].testPhase, 'inTest');
        assert.equal(actions[1].command.type, 'type-text');
        assert.equal(actions[1].command.selector, 'Selector(\'#developer-name\')');

        assert.equal(actions[2].apiName, 'eql');
        assert.equal(actions[2].testPhase, 'inTest');
        assert.equal(actions[2].command.type, 'assertion');
        assert.equal(actions[2].command.type, 'assertion');
        assert.equal(actions[2].command.assertionType, 'eql');
        assert.equal(actions[2].command.actual, 'Peter');
        assert.equal(actions[2].command.expected, 'Peter1');

        assert.equal(actions[3].apiName, 'match');
        assert.equal(actions[3].command.actual, 'foobar');
        assert.equal(actions[3].command.expected, /\/^f\//);
    }

    it('Should add test actions info to uploaded testRunInfo', async () => {
        let testRunInfo: DashboardTestRunInfo = null;
        let testDonePayload = null;

        function fetchMock (url, request) {
            const response  = { ok: true, status: 200, statusText: 'OK', json: null };
            const uploadUrl = 'upload_url';

            if (url.startsWith(`${TESTCAFE_DASHBOARD_URL}/api/uploader/getUploadUrl`))
                response.json = () => ({ uploadId: 'upload_id', uploadUrl });
            else if (url.startsWith(uploadUrl))
                testRunInfo = JSON.parse(request.body.toString()) as DashboardTestRunInfo;
            else if (url.startsWith(`${TESTCAFE_DASHBOARD_URL}/api/commands`)) {
                const { type, payload } = JSON.parse(request.body);

                if (type === AggregateCommandType.reportTestDone)
                    testDonePayload = payload;
            }

            return Promise.resolve(response as Response);
        }

        const reporter = buildReporterPlugin(() => reporterObjectFactory(() => void 0, fetchMock, SETTINGS, logger), process.stdout);

        const testRunIds = new Set(reportTestActionDoneCalls.map(call => call.actionInfo.testRunId));
        const testId     = 'test_1';

        await reporter.reportTestStart('Test 1', {}, { testRunIds: [...testRunIds], testId });

        for (const { apiActionName, actionInfo } of reportTestActionDoneCalls)
            await reporter.reportTestActionDone(apiActionName, actionInfo);

        await reporter.reportTestDone('Test 1', {
            browsers: [
                { ...FIREFOX, testRunId: 'firefox_1' },
                { ...CHROME, testRunId: 'chrome_1' },
                { ...CHROME_HEADLESS, testRunId: 'chrome_headless' }
            ],
            durationMs:     100,
            errs:           [],
            quarantine:     null,
            screenshotPath: '',
            screenshots:    [],
            skipped:        false,
            testId,
            unstable:       false,
            videos:         [],
            warnings:       []
        }, {});

        checkBrowserRun(testRunInfo.browserRuns['firefox_1'], FIREFOX.prettyUserAgent);
        checkBrowserRun(testRunInfo.browserRuns['chrome_1'], CHROME.prettyUserAgent);
        checkBrowserRun(testRunInfo.browserRuns['chrome_headless'], CHROME_HEADLESS.prettyUserAgent);

        assert.deepEqual(testDonePayload, {
            testId:     'test_1',
            errorCount: 0,
            duration:   100,
            uploadId:   'upload_id',
            skipped:    false
        });
    });

    it('Format error on test done', async () => {
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

        const testRunIds = twoErrorsTestActionDone.map(actionInfo => actionInfo.testRunId);

        await reporter.reportTestStart('Test 1', {}, { testRunIds });

        for (const actionInfo of twoErrorsTestActionDone) {
            actionInfo.err = new TestRunErrorFormattableAdapter(actionInfo.err,
                {
                    screenshotPath: '',
                    testRunPhase:   'inTest',
                    testRunId:      actionInfo.testRunId,
                    userAgent:      actionInfo.browser.prettyUserAgent
                }
            );
            await reporter.reportTestActionDone('name', actionInfo);
        }

        await reporter.reportTestDone('Test 1', testDoneInfo, {});

        assert.equal(testRunInfo.browserRuns[testRunIds[1]].actions[0].error.errorModel,
                     '{\"message\": \"The specified selector does not match any element in the DOM tree.\\n\\n\u00A0> | Selector(\'#developer-name1\')\", \n\n \"user-agent\": \"Chrome 80.0.3987.132 / Windows 10\"}');

        assert.equal(testRunInfo.browserRuns[testRunIds[0]].actions[0].error.errorModel,
                    '{\"message\": \"The specified selector does not match any element in the DOM tree.\\n\\n\u00A0> | Selector(\'#developer-name1\')\", \n\n \"user-agent\": \"Firefox 73.0 / Windows 10\"}');
    });
});

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

import assert from 'assert';
import mock from 'mock-require';
import { buildReporterPlugin, TestRunErrorFormattableAdapter } from 'testcafe/lib/embedding-utils';

import { ReporterPluginObject } from '../src/types/testcafe';
import { DashboardTestRunInfo, AggregateCommandType } from './../src/types/dashboard';
import { reportTestActionDoneCalls } from './data/report-test-action-done-calls';
import { CHROME, FIREFOX, CHROME_HEADLESS } from './data/test-browser-info';
import { testDoneInfo, twoErrorsTestActionDone, thirdPartyTestDone, skippedTestDone } from './data/';

const TESTCAFE_DASHBOARD_URL = 'http://localhost';
const TESTCAFE_DASHBOARD_AUTHENTICATION_TOKEN = 'authentication_token';

function mockReporter (fetchHandler): () => any {
    mock('isomorphic-fetch', fetchHandler);

    mock.reRequire('../lib/fetch');
    mock.reRequire('../lib/send-resolve-command');
    mock.reRequire('../lib/commands');
    mock.reRequire('../lib/upload');

    return mock.reRequire('../lib/index');
}

describe('reportTaskStart', () => {
    const buildId = 'test_build_id/:?&"=;+$';

    async function assertReporterMessage (expected: string): Promise<void> {
        const logs = [];

        mock('../lib/logger', {
            log: message => {
                logs.push(message);
            }
        });
        mock.reRequire('../lib/env-variables');
        const reporter = mock.reRequire('../lib/index')();

        await reporter.reportTaskStart(1, [], 1);
        assert.equal(logs.length, 1);
        assert.equal(logs[0], expected);
        mock.stop('../lib/logger');
    }

    before(() => {
        mock('../lib/env-variables', {
            TESTCAFE_DASHBOARD_URL,
            TESTCAFE_DASHBOARD_AUTHENTICATION_TOKEN,
        });
    });

    after(() => {
        mock.stop('../lib/env-variables');
    });

    it('Show reporter URL message', async () => {
        const projectId = 'mock_project_id';
        const reportId = 'mock_report_id';

        mock('uuid', ()=> {
            return reportId;
        });


        mock('isomorphic-fetch', () => {
            return Promise.resolve({ ok: true, status: 200, statusText: 'OK' });
        });

        mock('jsonwebtoken', {
            decode: () => ({ projectId })
        });

        await assertReporterMessage(`Task execution report: ${TESTCAFE_DASHBOARD_URL}/runs/${projectId}/${reportId}`);

        mock('../lib/env-variables', {
            TESTCAFE_DASHBOARD_URL,
            TESTCAFE_DASHBOARD_AUTHENTICATION_TOKEN,

            TESTCAFE_DASHBOARD_BUILD_ID: buildId
        });

        await assertReporterMessage(`Task execution report: ${TESTCAFE_DASHBOARD_URL}/runs/${projectId}/${encodeURIComponent(buildId)}`);

        mock.stop('uuid');
        mock.stop('jsonwebtoken');
        mock.stop('isomorphic-fetch');
    });

    it('Throw Exception if build id is too long', async () => {
        const longBuildId = 'test_build_id/123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890';

        mock('../lib/env-variables', {
            TESTCAFE_DASHBOARD_BUILD_ID: longBuildId
        });
        const reporter = mock.reRequire('../lib/index')();

        await assert.rejects(async () => await reporter.reportTaskStart(1, [], 1), {
            name:    'Error',
            message: `Build ID cannot be longer than 100 symbols. Build ID: ${longBuildId}.`
        });
    });
});

describe('reportTestActionDone', () => {
    before(() => {
        mock('../lib/env-variables', {
            TESTCAFE_DASHBOARD_URL,
            TESTCAFE_DASHBOARD_AUTHENTICATION_TOKEN
        });
    });

    after(() => {
        mock.stop('../lib/env-variables');
    });

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

        const reporter: ReporterPluginObject = buildReporterPlugin(mockReporter((url: string, request) => {
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

            return Promise.resolve(response);
        }), process.stdout);

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

        mock.stop('isomorphic-fetch');
    });

    it('Format error on test done', async () => {
        let testRunInfo: DashboardTestRunInfo = null;

        const reporter = buildReporterPlugin(mockReporter((url: string, request) => {
            const response  = { ok: true, status: 200, statusText: 'OK', json: null };
            const uploadUrl = 'upload_url';

            if (url.startsWith(`${TESTCAFE_DASHBOARD_URL}/api/uploader/getUploadUrl`))
                response.json = () => ({ uploadId: 'upload_id', uploadUrl });
            else if (url.startsWith(uploadUrl))
                testRunInfo = JSON.parse(request.body.toString());

            return Promise.resolve(response);
        }), process.stdout);

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

        mock.stop('isomorphic-fetch');
    });
});

describe('reportTestDone', () => {
    before(() => {
        mock('../lib/env-variables', {
            TESTCAFE_DASHBOARD_URL,
            TESTCAFE_DASHBOARD_AUTHENTICATION_TOKEN
        });
    });

    after(() => {
        mock.stop('../lib/env-variables');
        mock.stop('isomorphic-fetch');
    });

    it('Should process errors originated not from actions', async () => {
        let testRunInfo: DashboardTestRunInfo = null;

        const reporter: ReporterPluginObject = buildReporterPlugin(mockReporter((url: string, request) => {
            const response  = { ok: true, status: 200, statusText: 'OK', json: null };
            const uploadUrl = 'upload_url';

            if (url.startsWith(`${TESTCAFE_DASHBOARD_URL}/api/uploader/getUploadUrl`))
                response.json = () => ({ uploadId: 'upload_id', uploadUrl });
            else if (url.startsWith(uploadUrl))
                testRunInfo = JSON.parse(request.body.toString());

            return Promise.resolve(response);
        }), process.stdout);

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

        const reporter: ReporterPluginObject = buildReporterPlugin(mockReporter((url: string, request) => {
            const response  = { ok: true, status: 200, statusText: 'OK', json: () => Promise.resolve('') };

            if (url.startsWith(`${TESTCAFE_DASHBOARD_URL}/api/commands`)) {
                const { type, payload } = JSON.parse(request.body);

                if (type === AggregateCommandType.reportTestDone)
                    testDonePayload = payload;
            }

            return Promise.resolve(response);
        }), process.stdout);

        await reporter.reportTestDone('Test 1', skippedTestDone);

        assert.ok(testDonePayload);
        assert.ok(testDonePayload.skipped);
    });
});

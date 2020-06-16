import { DashboardTestRunInfo, CommandTypes } from './../src/types/dashboard';
import mock from 'mock-require';
import assert from 'assert';
import { reportTestActionDoneCalls } from './data/report-test-action-done-calls';
import { testDoneInfo, twoErrorsTestActionDone, thirdPartyTestDone } from './data/';
import { buildReporterPlugin, TestRunErrorFormattableAdapter } from 'testcafe/lib/embedding-utils';

const TESTCAFE_DASHBOARD_URL = 'http://localhost';
const TESTCAFE_DASHBOARD_AUTHENTICATION_TOKEN = 'authentication_token';

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

    it('Show reporter long build id message', async () => {
        const longBuildId = '123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890';

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

        mock('../lib/env-variables', {
            TESTCAFE_DASHBOARD_URL,
            TESTCAFE_DASHBOARD_AUTHENTICATION_TOKEN,

            TESTCAFE_DASHBOARD_BUILD_ID: buildId
        });

        await assertReporterMessage(`Build ID should not exceed 100 symbols. Build ID: ${longBuildId}.`);

        mock.stop('uuid');
        mock.stop('jsonwebtoken');
        mock.stop('isomorphic-fetch');
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
});

function mockReporter (fetchHandler): () => any {
    mock('isomorphic-fetch', fetchHandler);

    mock.reRequire('../lib/fetch');
    mock.reRequire('../lib/send-resolve-command');
    mock.reRequire('../lib/commands');
    mock.reRequire('../lib/upload');

    return mock.reRequire('../lib/index');
}

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
        assert.equal(actions.length, 5);

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

        assert.equal(actions[2].apiName, 'click');
        assert.equal(actions[2].testPhase, 'inTest');
        assert.equal(actions[2].command.type, 'click');
        assert.equal(actions[2].command.selector, 'Selector(\'#tried-test-cafe\')');
        assert.equal(actions[3].command.dragOffsetX, 94);
        assert.equal(actions[3].command.dragOffsetY, -2);

        assert.equal(actions[3].apiName, 'drag');
        assert.equal(actions[3].testPhase, 'inTest');
        assert.equal(actions[3].command.type, 'drag');
        assert.equal(actions[3].command.selector, 'Selector(\'.ui-slider-handle.ui-corner-all.ui-state-default\')');
        assert.equal(actions[3].command.options.offsetX, 8);
        assert.equal(actions[3].command.options.offsetY, 12);

        assert.equal(actions[4].apiName, 'eql');
        assert.equal(actions[4].testPhase, 'inTest');
        assert.equal(actions[4].command.type, 'assertion');
        assert.equal(actions[4].command.type, 'assertion');
        assert.equal(actions[4].command.assertionType, 'eql');
        assert.equal(actions[4].command.actual, 'Peter');
        assert.equal(actions[4].command.expected, 'Peter1');
    }

    it('Should add test actions info to uploaded testRunInfo', async () => {
        let testRunInfo = null;
        let testDonePayload = null;

        const reporter = mockReporter((url: string, request) => {
            const response  = { ok: true, status: 200, statusText: 'OK', json: null };
            const uploadUrl = 'upload_url';

            if (url.startsWith(`${TESTCAFE_DASHBOARD_URL}/api/uploader/getUploadUrl`))
                response.json = () => ({ uploadId: 'upload_id', uploadUrl });
            else if (url.startsWith(uploadUrl))
                testRunInfo = JSON.parse(request.body.toString());
            else if (url.startsWith(`${TESTCAFE_DASHBOARD_URL}/api/commands`)) {
                const { type, payload } = JSON.parse(request.body);

                if (type === CommandTypes.reportTestDone)
                    testDonePayload = payload;
            }

            return Promise.resolve(response);
        })();

        const testRunIds = new Set(reportTestActionDoneCalls.map(call => call.actionInfo.testRunId));

        await reporter.reportTestStart('Test 1', {}, { testRunIds: [...testRunIds] });

        for (const { apiActionName, actionInfo } of reportTestActionDoneCalls)
            await reporter.reportTestActionDone(apiActionName, actionInfo);

        await reporter.reportTestDone('Test 1', { screenshots: [], errs: [], videos: [], durationMs: 100 }, {});

        checkBrowserRun(testRunInfo.browserRuns['chrome'], 'Chrome 79.0.3945.130 / Windows 8.1');
        checkBrowserRun(testRunInfo.browserRuns['firefox'], 'Firefox 59.0 / Windows 8.1');
        checkBrowserRun(testRunInfo.browserRuns['chrome:headless'], 'Chrome 79.0.3945.130 / Windows 8.1');

        assert.deepEqual(testDonePayload, {
            name:       'Test 1',
            errorCount: 0,
            duration:   100,
            uploadId:   'upload_id'
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

        const testRunIds = new Set(twoErrorsTestActionDone.map(actionInfo => actionInfo.testRunId));

        await reporter.reportTestStart('Test 1', {}, { testRunIds: [...testRunIds] });

        for (const actionInfo of twoErrorsTestActionDone) {
            actionInfo.err = new TestRunErrorFormattableAdapter(actionInfo.err, {
                screenshotPath: '',
                testRunPhase:   'inTest',
                testRunId:      actionInfo.testRunId,
                userAgent:      actionInfo.browser.prettyUserAgent
            });
            await reporter.reportTestActionDone('name', actionInfo);
        }

        await reporter.reportTestDone('Test 1', testDoneInfo, {});

        assert.equal(testRunInfo.browserRuns['chrome'].actions[0].error.errorModel,
                     '{\"message\": \"The specified selector does not match any element in the DOM tree.\\n\\n\u00A0> | Selector(\'#developer-name1\')\", \n\n \"user-agent\": \"Chrome 80.0.3987.132 / Windows 10\"}');

        assert.equal(testRunInfo.browserRuns['firefox'].actions[0].error.errorModel,
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
    });

    it('Should process errors originated not form actions', async () => {
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

        await reporter.reportTestStart('Test 1', {}, { testRunIds: [thirdPartyTestDone.errs[0].testRunId] });
        await reporter.reportTestDone('Test 1', thirdPartyTestDone);

        const { thirdPartyError, actions, browser } = testRunInfo.browserRuns['chrome'];

        assert.ok(thirdPartyError);
        assert.deepEqual(actions, []);
        assert.ok(browser);
        assert.equal(browser.alias, 'chrome');
        assert.equal(browser.name, 'Chrome');
        assert.equal(browser.prettyUserAgent, thirdPartyTestDone.errs[0].userAgent);
        assert.ok(browser.version);
        assert.ok(browser.os);
        assert.ok(browser.os.name);
        assert.ok(browser.os.version);
    });
});

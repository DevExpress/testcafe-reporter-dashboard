import assert from 'assert';
import { sign } from 'jsonwebtoken';
import { buildReporterPlugin, TestRunErrorFormattableAdapter } from 'testcafe/lib/embedding-utils';
import { AggregateCommandType, DashboardSettings } from '../../src/types/internal';
import { reportTestActionDoneCalls } from '../data/report-test-action-done-calls';
import { CHROME, FIREFOX, CHROME_HEADLESS } from '../data/test-browser-info';
import { testDoneInfo, twoErrorsTestActionDone, testId } from '../data';
import reporterObjectFactory from '../../src/reporter-object-factory';
import { DashboardTestRunInfo } from '../../src/types';
import { mockReadFile } from '../mocks';
import { TC_OLDEST_COMPATIBLE_VERSION } from '../../src/validate-settings';

const TESTCAFE_DASHBOARD_URL      = 'http://localhost';
const AUTHENTICATION_TOKEN        = sign({ projectId: 'project_1' }, 'jwt_secret');
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

describe('reportTestActionDone', () => {
    const loggerMock = {
        log:   () => void 0,
        warn:  () => void 0,
        error: () => void 0
    };

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
        let testRunInfo;
        let testDonePayload = null;

        function fetchMock (url, request) {
            const response  = { ok: true, status: 200, statusText: 'OK' } as Response;
            const uploadUrl = 'upload_url';

            if (url === `${TESTCAFE_DASHBOARD_URL}/api/getUploadUrl`)
                response.json = () => Promise.resolve({ uploadId: 'upload_id', uploadUrl });
            else if (url.startsWith(uploadUrl))
                testRunInfo = JSON.parse(request.body.toString()) as DashboardTestRunInfo;
            else if (url.startsWith(`${TESTCAFE_DASHBOARD_URL}/api/commands`)) {
                const { type, payload } = JSON.parse(request.body);

                if (type === AggregateCommandType.reportTestDone)
                    testDonePayload = payload;
            }

            return Promise.resolve(response as unknown as Response);
        }

        const reporter = buildReporterPlugin(() => reporterObjectFactory(
                mockReadFile, fetchMock, SETTINGS, loggerMock, TC_OLDEST_COMPATIBLE_VERSION
            ), process.stdout);

        await reporter.reportTaskStart(new Date(), [], 1, [], { configuration: {}, dashboardUrl: '' });

        const testRunIds = new Set(reportTestActionDoneCalls.map(call => call.actionInfo.testRunId));

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
            unstable:       true,
            videos:         [],
            warnings:       []
        }, {});

        checkBrowserRun(testRunInfo.browserRuns['firefox_1'], FIREFOX.prettyUserAgent);
        checkBrowserRun(testRunInfo.browserRuns['chrome_1'], CHROME.prettyUserAgent);
        checkBrowserRun(testRunInfo.browserRuns['chrome_headless'], CHROME_HEADLESS.prettyUserAgent);

        assert.deepEqual(testDonePayload, {
            testId:     'Test_1',
            errorCount: 0,
            duration:   100,
            uploadId:   'upload_id',
            skipped:    false,
            unstable:   true
        });
    });

    it('Format error on test done', async () => {
        let testRunInfo;

        function fetchMock (url: string, request) {
            const response  = { ok: true, status: 200, statusText: 'OK' } as Response;
            const uploadUrl = 'upload_url';

            if (url === `${TESTCAFE_DASHBOARD_URL}/api/getUploadUrl`)
                response.json = () => Promise.resolve({ uploadId: 'upload_id', uploadUrl });
            else if (url.startsWith(uploadUrl))
                testRunInfo = JSON.parse(request.body.toString());

            return Promise.resolve(response as unknown as Response);
        }

        const reporter = buildReporterPlugin(() => reporterObjectFactory(
                mockReadFile, fetchMock, SETTINGS, loggerMock, TC_OLDEST_COMPATIBLE_VERSION
            ), process.stdout);

        await reporter.reportTaskStart(new Date(), [], 1, [], { configuration: {}, dashboardUrl: '' });

        const testRunIds = twoErrorsTestActionDone.map(actionInfo => actionInfo.testRunId);

        await reporter.reportTestStart('Test 1', {}, { testRunIds, testId });

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

        await reporter.reportTestDone('Test 1', { ...testDoneInfo, testId }, {});

        assert.equal(testRunInfo.browserRuns[testRunIds[1]].actions[0].error.errorModel,
                     '{\"message\": \"The specified selector does not match any element in the DOM tree.\\n\\n\u00A0> | Selector(\'#developer-name1\')\", \n\n \"user-agent\": \"Chrome 80.0.3987.132 / Windows 10\"}');

        assert.equal(testRunInfo.browserRuns[testRunIds[0]].actions[0].error.errorModel,
                    '{\"message\": \"The specified selector does not match any element in the DOM tree.\\n\\n\u00A0> | Selector(\'#developer-name1\')\", \n\n \"user-agent\": \"Firefox 73.0 / Windows 10\"}');
    });
});

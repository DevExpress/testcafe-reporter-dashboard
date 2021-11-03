import { sign } from 'jsonwebtoken';
import assert from 'assert';
import reporterObjectFactory from '../src/reporter-object-factory';
import { DashboardSettings } from '../src/types/internal';
import { TC_OLDEST_COMPATIBLE_VERSION } from '../src/validate-settings';
import { reportTestActionDoneCalls } from './data/report-test-action-done-calls';
import { testDoneInfo } from './data';
import { mockReadFile } from './mocks';
import { FIREFOX } from './data/test-browser-info';
import { AUTHENTICATION_TOKEN_REJECTED } from '../src/texts';

const TESTCAFE_DASHBOARD_URL      = 'http://localhost';
const AUTHENTICATION_TOKEN        = sign({ projectId: 'project_1' }, 'jwt_secret');
const SETTINGS: DashboardSettings = {
    authenticationToken: AUTHENTICATION_TOKEN,
    buildId:             'id',
    dashboardUrl:        TESTCAFE_DASHBOARD_URL,
    isLogEnabled:        false,
    noScreenshotUpload:  false,
    noVideoUpload:       false,
    responseTimeout:     1000,
    requestRetryCount:   10
};

describe('initReporter', () => {
    const errorText = 'not good';

    let requests: { url: string; method: string }[] = [];

    let logs: string[]   = [];
    let errors: string[] = [];

    const loggerMock = {
        log:   message => logs.push(message),
        warn:  () => void 0,
        error: message => errors.push(message)
    };

    beforeEach(() => {
        requests = [];
        logs     = [];
        errors   = [];
    });

    function fetchOkMock (url, { method }) {
        requests.push({ url, method });

        return Promise.resolve({ ok: true, status: 200, statusText: 'OK' } as Response);
    };

    function fetchFailMock () {
        return Promise.resolve({ ok: false, status: 401, statusText: 'Unauthorized', text: () => Promise.resolve(errorText) } as Response);
    }

    function fetchFailSilentMock () {
        return Promise.resolve({ ok: false, status: 401, statusText: 'Unauthorized' } as Response);
    }

    function getReporter (fetchMock) {
        return reporterObjectFactory(mockReadFile, fetchMock, SETTINGS, loggerMock, TC_OLDEST_COMPATIBLE_VERSION);
    }

    it('Should send a request and report success', async () => {
        const reporter = getReporter(fetchOkMock);

        await reporter.reportTaskStart(new Date(), [], 1, []);

        assert.strictEqual(errors.length, 0);
        assert.strictEqual(requests[0].url, `http://localhost/api/validateReporter?reportId=id&tcVersion=${TC_OLDEST_COMPATIBLE_VERSION}`);
        assert.strictEqual(requests[0].method, 'POST');
        assert.strictEqual(logs.length, 1);
        assert.strictEqual(logs[0], 'Task execution report: http://localhost/runs/project_1/id');
    });

    it('Should throw on error and run no further', async () => {
        const reporter = getReporter(fetchFailMock);

        await reporter.reportTaskStart(new Date(), [], 1, []);

        const { actionInfo: { test, testRunId }, apiActionName } = reportTestActionDoneCalls[0];

        await reporter.reportTestStart(test.name, {}, { testRunId: [testRunId], testId: test.id });
        await reporter.reportTestActionDone(apiActionName, reportTestActionDoneCalls[0].actionInfo);
        await reporter.reportTestDone(test.name, {
            ...testDoneInfo,
            browsers: [ { ...FIREFOX, testRunId: testRunId } ],
            testId:   test.id
        });
        await reporter.reportTaskDone(new Date(), 0, [], { failedCount: 1, passedCount: 0, skippedCount: 0 });

        assert.strictEqual(errors.length, 1);
        assert.strictEqual(errors[0], errorText);
        assert.strictEqual(requests.length, 1);
    });

    it('Should use default error text', async () => {
        const reporter = getReporter(fetchFailSilentMock);

        await reporter.reportTaskStart(new Date(), [], 1, []);

        assert.strictEqual(errors.length, 1);
        assert.strictEqual(errors[0], AUTHENTICATION_TOKEN_REJECTED);
    });
});

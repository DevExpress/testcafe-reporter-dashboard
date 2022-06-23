import { sign } from 'jsonwebtoken';
import assert from 'assert';
import { buildReporterPlugin } from 'testcafe/lib/embedding-utils';
import reporterObjectFactory from '../../src/reporter-object-factory';
import { DashboardSettings } from '../../src/types/internal';
import { TC_OLDEST_COMPATIBLE_VERSION } from '../../src/validate-settings';
import { mockReadFile } from '../mocks';
import { AUTHENTICATION_TOKEN_REJECTED } from '../../src/texts';
import { testDoneInfo } from '../data';
import { DashboardValidationResult, RUNS_LIMIT_EXCEEDED_ERROR_MESSAGE } from '../../src/types/common';
import { DashboardInfo } from '../../src/types';


const TESTCAFE_DASHBOARD_URL      = 'http://localhost';
const AUTHENTICATION_TOKEN        = sign({ projectId: 'project_1' }, 'jwt_secret');
const SETTINGS: DashboardSettings = {
    authenticationToken: AUTHENTICATION_TOKEN,
    buildId:             'buildId',
    runId:               'runId',
    dashboardUrl:        TESTCAFE_DASHBOARD_URL,
    isLogEnabled:        false,
    noScreenshotUpload:  false,
    noVideoUpload:       false,
    responseTimeout:     1000,
    requestRetryCount:   10
};

async function runReporterLifecycleMethods (reporter: any, requests: { url: string; method: string; body: string }[]) {
    await reporter.init();

    assert.strictEqual(requests.length, 1);

    await reporter.reportTaskStart(new Date(), [], 1, [], { configuration: {}, dashboardUrl: '' });
    await reporter.reportTestStart('', {}, { testId: 'testId', testRunId: [''], testRunIds: ['testRunId'] });
    await reporter.reportTestDone('Test 1', { ...testDoneInfo, testId: 'testId' }, {});
    await reporter.reportTaskDone(new Date(), 1, [''], { failedCount: 2, passedCount: 1, skippedCount: 0 });
}

describe('initReporter', () => {
    const errorText = 'not good';

    let requests: { url: string; method: string; body: string }[] = [];

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

    function fetchOkMock (url, { method, body }) {
        requests.push({ url, method, body });

        return Promise.resolve({ ok:         true, status:     200, statusText: 'OK',
            json:       () => Promise.resolve('okMock') } as Response);
    };

    function fetchFailMock (url, { method, body }) {
        requests.push({ url, method, body });

        const error =  { message: errorText } as DashboardInfo;

        return Promise.resolve({ ok:         false, status:     401, statusText: 'Unauthorized',
            json:       () => Promise.resolve(error)
        });
    }

    function fetchFailSilentMock () {
        const silentError =  { message: '' } as DashboardInfo;

        return Promise.resolve({ ok:         false, status:     401, statusText: 'Unauthorized',
            json:       () => Promise.resolve(silentError)
        });
    }

    function getReporter (fetchMock) {
        return buildReporterPlugin(() => reporterObjectFactory(
            mockReadFile, fetchMock, SETTINGS, loggerMock, TC_OLDEST_COMPATIBLE_VERSION
        ), process.stdout);
    }

    async function assertInitError (reporter, expectedError) {
        let errorMessage;

        try {
            await reporter.init();
        }
        catch (e) {
            errorMessage = e.message;
        }
        finally {
            assert.strictEqual(errorMessage, expectedError);
        }
    }

    function fetchOutOfLimits (url, { method, body }) {
        const outOfLimitResponseJson =
            { type: DashboardValidationResult.warning, message: RUNS_LIMIT_EXCEEDED_ERROR_MESSAGE } as DashboardInfo;

        ;

        requests.push({ url, method, body });

        return Promise.resolve({ ok:         true, status:     200, statusText: 'OK',
            json:       () => Promise.resolve(outOfLimitResponseJson)
        });
    };

    it('requests are blocked when reports are out of limits', async () => {
        const reporter = getReporter(fetchOutOfLimits);

        assert.strictEqual(requests.length, 0);

        await runReporterLifecycleMethods(reporter, requests);

        assert.strictEqual(requests.length, 1);
    });

    it('requests are not blocked when reports are within limits', async () => {
        const reporter = getReporter(fetchOkMock);

        assert.strictEqual(requests.length, 0);

        await runReporterLifecycleMethods(reporter, requests);

        assert.ok(requests.length >= 5);
    });

    it('Should send a request and report success', async () => {
        const reporter = getReporter(fetchOkMock);

        await reporter.init();
        await reporter.reportTaskStart(new Date(), [], 1, [], { configuration: {}, dashboardUrl: '' });

        assert.strictEqual(errors.length, 0);
        assert.strictEqual(requests[0].url, 'http://localhost/api/validateReporter');
        assert.strictEqual(requests[0].method, 'POST');

        const { reportId, tcVersion, reporterVersion } = JSON.parse(requests[0].body);

        assert.strictEqual(reportId, 'runId');
        assert.strictEqual(tcVersion, TC_OLDEST_COMPATIBLE_VERSION);
        assert.match(reporterVersion, /[0-1]\.[0-9]*\.[0-9]/);
        assert.strictEqual(logs.length, 1);
        assert.strictEqual(logs[0], 'Task execution report: http://localhost/runs/project_1/buildId');
    });

    it('Should throw on error', async () => {
        const reporter = getReporter(fetchFailMock) as any;

        await assertInitError(reporter, errorText);
        assert.strictEqual(errors.length, 1);
        assert.strictEqual(errors[0], errorText);
        assert.strictEqual(requests.length, 1);
    });

    it('Should use default error text', async () => {
        const reporter = getReporter(fetchFailSilentMock);

        await assertInitError(reporter, AUTHENTICATION_TOKEN_REJECTED);
        assert.strictEqual(errors.length, 1);
        assert.strictEqual(errors[0], AUTHENTICATION_TOKEN_REJECTED);
    });
});

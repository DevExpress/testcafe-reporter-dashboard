import assert from 'assert';
import { sign } from 'jsonwebtoken';
import { buildReporterPlugin } from 'testcafe/lib/embedding-utils';
import { DashboardSettings } from '../../src/types/internal/dashboard';
import reporterObjectFactory from '../../src/reporter-object-factory';
import { Name, ShortId } from '../../src/types/common';
import { TC_OLDEST_COMPATIBLE_VERSION } from '../../src/validate-settings';
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
    responseTimeout:     1000,
    requestRetryCount:   10
};

describe('reportTestDone', () => {
    const logs: string[] = [];
    const loggerMock     = {
        log:   message => logs.push(message),
        warn:  message => logs.push(message),
        error: message => logs.push(message)
    };

    let lastRequest;

    function fetchMock (url, options) {
        lastRequest = { url, body: JSON.parse(options.body) };

        return Promise.resolve({ ok: true, status: 200, statusText: 'OK' } as Response);
    };

    const projectId = 'mock_project_id';

    const authenticationToken = sign({ projectId }, 'secret');

    it('should not execute command for skipped test', async () => {
        const reporter      =  buildReporterPlugin(() => reporterObjectFactory(mockReadFile, fetchMock, { ...SETTINGS, authenticationToken }, loggerMock, TC_OLDEST_COMPATIBLE_VERSION));
        const taskStructure = [{
            fixture: {
                id:    'fixture1' as Name,
                name:  'Fixture1' as Name,
                tests: [
                    { id: 'test1' as ShortId, name: 'Test1' as Name, skip: true },
                    { id: 'test2' as ShortId, name: 'Test2' as Name, skip: false }
                ]
            }
        }];

        await reporter.reportTaskStart(new Date(), [], 2, taskStructure);

        await reporter.reportTestStart('Test1', {}, { testRunIds: ['test1'], testRunId: ['test1'], testId: 'test1' });

        assert.equal(lastRequest.url, 'http://localhost/api/commands/');
        assert.equal(lastRequest.body.type, 'reportTaskStart');

        await reporter.reportTestStart('Test2', {}, { testRunIds: ['test2'], testRunId: ['test2'], testId: 'test2' });

        assert.equal(lastRequest.url, 'http://localhost/api/commands/');
        assert.equal(lastRequest.body.type, 'reportTestStart');
        assert.deepEqual(lastRequest.body.payload, { testId: 'test2' });
    });
});

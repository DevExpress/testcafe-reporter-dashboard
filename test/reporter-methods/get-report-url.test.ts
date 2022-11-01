import assert from 'assert';
import { sign } from 'jsonwebtoken';
import { reporterObjectFactory } from '../../src/reporter-object-factory';
import { TC_OLDEST_COMPATIBLE_VERSION } from '../../src/validate-settings';
import { mockFileExists, mockReadFile } from '../mocks';


const TESTCAFE_DASHBOARD_URL = 'http://localhost';
const AUTHENTICATION_TOKEN   = 'authentication_token';

const SETTINGS = {
    authenticationToken: AUTHENTICATION_TOKEN,
    buildId:             void 0,
    dashboardUrl:        TESTCAFE_DASHBOARD_URL,
    isLogEnabled:        false,
    noScreenshotUpload:  false,
    noVideoUpload:       false,
    responseTimeout:     1000,
    requestRetryCount:   10
};

describe('getReportUrl', () => {
    const logs: string[] = [];
    const loggerMock     = {
        log:   message => logs.push(message),
        warn:  message => logs.push(message),
        error: message => logs.push(message)
    };

    function fetchMock () {
        return Promise.resolve({ ok: true, status: 200, statusText: 'OK' } as Response);
    };


    it('Show reporter URL message', async () => {
        const projectId = 'mock_project_id';
        const reportId  = 'mock_report_id';

        const authenticationToken = sign({ projectId }, 'secret');

        const settings = {
            ...SETTINGS,
            authenticationToken,
            runId: reportId
        };

        const reporter = reporterObjectFactory(mockReadFile, mockFileExists, fetchMock, settings, loggerMock, TC_OLDEST_COMPATIBLE_VERSION);

        const reportUrl = reporter.getReportUrl();

        assert.strictEqual(reportUrl, 'http://localhost/runs/mock_project_id/mock_report_id');
    });
});

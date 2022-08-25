import assert from 'assert';
import { sign } from 'jsonwebtoken';
import { DashboardSettings } from '../../src/types/internal/dashboard';
import { reporterObjectFactory } from '../../src/reporter-object-factory';
import { BuildId } from '../../src/types';
import { TC_OLDEST_COMPATIBLE_VERSION } from '../../src/validate-settings';
import { mockFileExists, mockReadFile } from '../mocks';

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

describe('reportTaskStart', () => {
    const buildId = 'test_build_id/:?&"=;+$';

    async function assertReporterMessage (expected: string, settings: DashboardSettings): Promise<void> {
        const logs: string[] = [];
        const loggerMock     = {
            log:   message => logs.push(message),
            warn:  message => logs.push(message),
            error: message => logs.push(message)
        };

        function fetchMock () {
            return Promise.resolve({ ok: true, status: 200, statusText: 'OK' } as Response);
        };

        const reporter = reporterObjectFactory(mockReadFile, mockFileExists, fetchMock, settings, loggerMock, TC_OLDEST_COMPATIBLE_VERSION);

        await reporter.reportTaskStart(new Date(), [], 1, [], { configuration: {}, dashboardUrl: '' });

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
            { ...SETTINGS, authenticationToken, runId: reportId, buildId: buildId as BuildId }
        );
    });
});

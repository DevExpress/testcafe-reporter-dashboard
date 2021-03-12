import assert from 'assert';
import { DashboardSettings } from '../src/types/internal/dashboard';
import reporterObjectFactory from '../src/reporter-object-factory';
import logger from '../src/logger';
import { AUTHENTICATION_TOKEN_NOT_DEFINED, createLongBuildIdError, DASHBOARD_LOCATION_NOT_DEFINED } from '../src/texts';
import BLANK_REPORTER from '../src/blank-reporter';
import { BuildId } from '../src/types';
import { ReporterPluginObject } from '../src/types/internal';
import { mockReadFile } from './mocks';

const TESTCAFE_DASHBOARD_URL      = 'http://localhost';
const AUTHENTICATION_TOKEN        = 'authentication_token';
const SETTINGS: DashboardSettings = {
    authenticationToken: AUTHENTICATION_TOKEN,
    buildId:             void 0,
    dashboardUrl:        TESTCAFE_DASHBOARD_URL,
    isLogEnabled:        false,
    noScreenshotUpload:  false,
    noVideoUpload:       false,
};

describe('Reporter factory', () => {
    let errors: string[];
    const loggerMock = { ...logger, error: message => errors.push(message) };
    const mockFetch = () => Promise.resolve({} as Response);
    const createReporter = (settings: Partial<DashboardSettings>): ReporterPluginObject =>
        reporterObjectFactory(
            mockReadFile,
            mockFetch,
            { ...SETTINGS, ...settings },
            loggerMock
        );

    beforeEach(() => {
        errors = [];
    });

    it('Show build ID validation error', async () => {
        const longBuildId      = 'test_build_id/123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890';
        const reporter         = createReporter({ buildId: longBuildId as BuildId });

        assert.equal(errors.length, 1);
        assert.equal(errors[0], createLongBuildIdError(longBuildId));
        assert.equal(reporter, BLANK_REPORTER);
    });

    it('Show authentication token validation error', async () => {
        const reporter = createReporter({ authenticationToken: '' });

        assert.equal(errors.length, 1);
        assert.equal(errors[0], AUTHENTICATION_TOKEN_NOT_DEFINED);
        assert.equal(reporter, BLANK_REPORTER);
    });

    it('Show dashboard URL validation error', async () => {
        const reporter = createReporter({ dashboardUrl: '' });

        assert.equal(errors.length, 1);
        assert.equal(errors[0], DASHBOARD_LOCATION_NOT_DEFINED);
        assert.equal(reporter, BLANK_REPORTER);
    });
});

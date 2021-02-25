import assert from 'assert';
import { DashboardSettings } from './../src/types/dashboard';
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
    noVideoUpload:       false,
    ciInfo:              {
        author: ''
    }
};

describe('Reporter factory', () => {
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

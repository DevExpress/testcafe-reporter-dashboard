import assert from 'assert';
import { sign } from 'jsonwebtoken';
import { DashboardSettings } from '../src/types/internal/dashboard';
import { reporterObjectFactory } from '../src/reporter-object-factory';
import logger from '../src/logger';
import { AUTHENTICATION_TOKEN_INVALID, AUTHENTICATION_TOKEN_NOT_DEFINED, BUILD_ID_IS_NOT_A_STRING_ERROR, createLongBuildIdError, createTestCafeVersionIncompatibledError, createTestCafeVersionInvalidError, DASHBOARD_LOCATION_NOT_DEFINED } from '../src/texts';
import BLANK_REPORTER from '../src/blank-reporter';
import { BuildId } from '../src/types';
import { TC_OLDEST_COMPATIBLE_VERSION } from '../src/validate-settings';
import { ReporterPluginObject } from '../src/types/internal';
import { mockFileExists, mockReadFile, SETTINGS } from './mocks';

describe('Reporter factory', () => {
    let errors: string[];
    const loggerMock = { ...logger, error: message => errors.push(message) };
    const mockFetch = () => Promise.resolve({} as Response);
    const createReporter = (settings: Partial<DashboardSettings>, tcVersion = TC_OLDEST_COMPATIBLE_VERSION): ReporterPluginObject =>
        reporterObjectFactory(
            mockReadFile,
            mockFileExists,
            mockFetch,
            { ...SETTINGS, ...settings },
            loggerMock,
            tcVersion
        );

    beforeEach(() => {
        errors = [];
    });

    it('Show build ID max length validation error', async () => {
        const longBuildId      = 'test_build_id/123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890';
        const reporter         = createReporter({ buildId: longBuildId as BuildId });

        assert.equal(errors.length, 1);
        assert.equal(errors[0], createLongBuildIdError(longBuildId));
        assert.equal(reporter, BLANK_REPORTER);
    });

    it('Show build ID type validation error', async () => {
        const reporter = createReporter({ buildId: 1234567 as unknown as BuildId });

        assert.equal(errors.length, 1);
        assert.equal(errors[0], BUILD_ID_IS_NOT_A_STRING_ERROR);
        assert.equal(reporter, BLANK_REPORTER);
    });

    it('Show authentication token not defined error', async () => {
        const reporter = createReporter({ authenticationToken: '' });

        assert.equal(errors.length, 1);
        assert.equal(errors[0], AUTHENTICATION_TOKEN_NOT_DEFINED);
        assert.equal(reporter, BLANK_REPORTER);
    });

    it('Throw authentication token (legacy) invalid error', async () => {
        let error = null;

        try {
            createReporter({ authenticationToken: sign({ user: 'user_1' }, 'jwt_secret') });
        }
        catch (e) {
            error = e;
        }

        assert(error, new Error(AUTHENTICATION_TOKEN_INVALID));
    });

    it('Throw authentication token (new) invalid error', async () => {
        let error = null;

        try {
            createReporter({ authenticationToken: Buffer.from('abcdefghijklm').toString('base64') });
        }
        catch (e) {
            error = e;
        }

        assert(error, new Error(AUTHENTICATION_TOKEN_INVALID));
    });

    it('Show dashboard URL validation error', async () => {
        const reporter = createReporter({ dashboardUrl: '' });

        assert.equal(errors.length, 1);
        assert.equal(errors[0], DASHBOARD_LOCATION_NOT_DEFINED);
        assert.equal(reporter, BLANK_REPORTER);
    });

    it('Throw TestCafe invalid version error', async () => {
        let error = null;

        try {
            createReporter({ }, '1.asdfasd.2');
        }
        catch (e) {
            error = e;
        }

        assert(error, new Error(createTestCafeVersionInvalidError('1.asdfasd.2')));
    });

    it('Throw TestCafe incompatible version error', async () => {
        let error = null;

        try {
            createReporter({ }, '1.14.1');
        }
        catch (e) {
            error = e;
        }

        assert(error, new Error(createTestCafeVersionIncompatibledError('1.14.1')));
    });
});

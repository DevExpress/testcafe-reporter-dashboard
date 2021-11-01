import assert from 'assert';
import getReporterSettings from '../src/get-reporter-settings';

describe('getReporterSettings()', () => {
    it('should take options from reporter options', () => {
        const options = {
            token:              'token_from_args',
            dashboardUrl:       'https://ddev.testcafe.io',
            buildId:            'buildId_from_args',
            noVideoUpload:      true,
            noScreenshotUpload: true,
            isLogEnabled:       true,
            requestRetryCount:  1,
            responseTimeout:    10000
        };

        const expectedSettings = {
            authenticationToken: 'token_from_args',
            dashboardUrl:        'https://ddev.testcafe.io',
            buildId:             'buildId_from_args',
            noVideoUpload:       true,
            noScreenshotUpload:  true,
            isLogEnabled:        true,
            requestRetryCount:   1,
            responseTimeout:     10000,
            ciInfo:              void 0
        };

        assert.deepEqual(getReporterSettings(options), expectedSettings);
    });
});

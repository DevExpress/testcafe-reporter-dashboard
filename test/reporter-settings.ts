import assert from 'assert';
import getReporterSettings from '../src/get-reporter-settings';

describe('getReporterSettings()', () => {
    it('should take options from reporter options', () => {
        const options = {
            token:              '123',
            buildId:            '321',
            noVideoUpload:      true,
            noScreenshotUpload: true,
            isLogEnabled:       true
        };

        const expectedSettings = {
            authenticationToken: '123',
            dashboardUrl:        'https://dashboard.testcafe.io',
            buildId:             '321',
            noVideoUpload:       true,
            noScreenshotUpload:  true,
            isLogEnabled:        true,
            requestRetryCount:   20,
            responseTimeout:     30000,
            ciInfo:              void 0
        };

        assert.deepEqual(getReporterSettings(options), expectedSettings);
    });
});

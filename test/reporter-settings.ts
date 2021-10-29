import assert from 'assert';
import getReporterSettings from '../src/get-reporter-settings';

describe('getReporterSettings()', () => {
    it('should take options from reporter options', () => {
        const options = { token: '123', noVideoUpload: true, buildId: '321' };

        assert.equal(getReporterSettings(options), { authenticationToken: '123', build: '321' });
    });
});

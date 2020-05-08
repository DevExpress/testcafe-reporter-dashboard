import assert from 'assert';
import { DISABLE_SCREENSHOTS_UPLOAD, DISABLE_VIDEO_UPLOAD } from '../src/env-variables';

describe('enviroment variables', () => {
    describe('enviroment variables', () => {
        it('Screenshots and videos upload should be enabled by default', () => {
            assert.equal(DISABLE_SCREENSHOTS_UPLOAD, false);
            assert.equal(DISABLE_VIDEO_UPLOAD, false);
        });

        it('Screenshots and videos upload should be enabled if value is "false"', () => {
            process.env.DISABLE_SCREENSHOTS_UPLOAD = 'false';
            process.env.DISABLE_VIDEO_UPLOAD       = 'false';

            assert.equal(DISABLE_SCREENSHOTS_UPLOAD, false);
            assert.equal(DISABLE_VIDEO_UPLOAD, false);
        });
    });
});

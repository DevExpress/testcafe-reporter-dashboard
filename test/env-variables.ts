import assert from 'assert';
import { NO_SCREENSHOT_UPLOAD, NO_VIDEO_UPLOAD } from '../src/env-variables';

describe('enviroment variables', () => {
    describe('enviroment variables', () => {
        it('Screenshots and videos upload should be enabled by default', () => {
            assert.equal(NO_SCREENSHOT_UPLOAD, false);
            assert.equal(NO_VIDEO_UPLOAD, false);
        });

        it('Screenshots and videos upload should be enabled if value is "false"', () => {
            process.env.NO_SCREENSHOT_UPLOAD = 'false';
            process.env.NO_VIDEO_UPLOAD      = 'false';

            assert.equal(NO_SCREENSHOT_UPLOAD, false);
            assert.equal(NO_VIDEO_UPLOAD, false);
        });
    });
});

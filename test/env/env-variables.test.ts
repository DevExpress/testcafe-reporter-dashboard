import assert from 'assert';
import { NO_SCREENSHOT_UPLOAD, NO_VIDEO_UPLOAD, CI_INFO } from '../../src/env';

describe('Enviroment variables defaults', () => {
    it('Screenshots and videos upload should be enabled by default', () => {
        assert.equal(NO_SCREENSHOT_UPLOAD, false);
        assert.equal(NO_VIDEO_UPLOAD, false);
        assert.equal(CI_INFO, void 0);
    });
});

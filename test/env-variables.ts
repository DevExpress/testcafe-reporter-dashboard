import assert from 'assert';
import { ENABLE_SCREENSHOTS_UPLOAD, ENABLE_VIDEO_UPLOAD } from '../src/env-variables';

describe('enviroment variables', () => {
    it('Screenshots and videos upload should be enabled by default', () => {
        assert.ok(ENABLE_SCREENSHOTS_UPLOAD);
        assert.ok(ENABLE_VIDEO_UPLOAD);
    });
});

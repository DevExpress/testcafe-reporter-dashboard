import assert from 'assert';
import { NO_SCREENSHOT_UPLOAD, NO_VIDEO_UPLOAD } from '../src/env';
import mock from 'mock-require';

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

    it('Screenshots and videos upload should be enabled if value is "0"', () => {
        process.env.NO_SCREENSHOT_UPLOAD = '0';
        process.env.NO_VIDEO_UPLOAD      = '0';

        assert.equal(NO_SCREENSHOT_UPLOAD, false);
        assert.equal(NO_VIDEO_UPLOAD, false);
    });

    describe('CI detection', () => {
        beforeEach(() => {
            process.env = {};
        });

        it('Should detect Github Actions', () => {
            let { isGithubActions } = mock.reRequire('../src/env/ci-detection');

            assert.equal(isGithubActions, false);

            process.env.GITHUB_ACTIONS = 'true';

            isGithubActions = mock.reRequire('../src/env/ci-detection').isGithubActions;

            assert.equal(isGithubActions, true);
        });
    });
});

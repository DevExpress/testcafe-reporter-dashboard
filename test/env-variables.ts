import assert from 'assert';
import { NO_SCREENSHOT_UPLOAD, NO_VIDEO_UPLOAD } from '../src/env';
import mock from 'mock-require';

describe('enviroment variables', () => {
    beforeEach(() => {
        process.env = {};
    });

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
        it('Should detect Github Actions', () => {
            let { isGithubActions } = mock.reRequire('../src/env/ci-detection');

            assert.equal(isGithubActions, false);

            process.env.GITHUB_ACTIONS = 'true';

            isGithubActions = mock.reRequire('../src/env/ci-detection').isGithubActions;

            assert.equal(isGithubActions, true);
        });
    });

    it('Should set author name to empty string by default', () => {
        mock.reRequire('../src/env/ci-detection');
        mock.reRequire('../src/env/github-actions');
        mock.reRequire('../src/env/get-ci-info');
        const { CI_INFO } = mock.reRequire('../src/env');

        assert.deepEqual(CI_INFO, {
            author: ''
        });
    });

    describe('Github Actions CI info', () => {
        let readResult = '';

        before(() => {
            process.env.GITHUB_ACTIONS = 'true';
            mock('fs', { readFileSync: () => readResult });
            mock.reRequire('../src/env/ci-detection');
            mock.reRequire('../src/env/github-actions');
            mock.reRequire('../src/env/get-ci-info');
        });

        afterEach(() => {
            readResult = '';
        });

        after(() => {
            mock.stopAll();
        });

        it('Should detect author name', () => {
            const name = 'Luke';

            readResult = JSON.stringify({
                'pull_request': { user: { login: name } }
            });

            const { CI_INFO } = mock.reRequire('../src/env');

            assert.deepEqual(CI_INFO, {
                author: name
            });
        });
    });
});

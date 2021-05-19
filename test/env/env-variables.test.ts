import assert from 'assert';
import mock from 'mock-require';

import { clearCIVariables, restoreCIVariables } from '../mocks';

describe('Enviroment variables defaults', () => {
    beforeEach(clearCIVariables);

    afterEach(restoreCIVariables);

    it('Screenshots and videos upload should be enabled by default', () => {
        const { NO_SCREENSHOT_UPLOAD, NO_VIDEO_UPLOAD, CI_INFO } = mock.reRequire('../../src/env');

        assert.equal(NO_SCREENSHOT_UPLOAD, false);
        assert.equal(NO_VIDEO_UPLOAD, false);
        assert.equal(CI_INFO, void 0);
    });
});

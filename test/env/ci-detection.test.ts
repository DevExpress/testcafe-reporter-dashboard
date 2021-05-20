import assert from 'assert';
import mock from 'mock-require';

import { CI_DETECTION_VARIABLES } from '../data/ci-variables';
import { clearCIDetectionVariables, restoreCIDetectionVariables } from '../mocks';

describe('CI detection', () => {
    beforeEach(clearCIDetectionVariables);

    afterEach(restoreCIDetectionVariables);

    for (const CIVariable of CI_DETECTION_VARIABLES) {
        it(`Should detect ${CIVariable.CISystem} CI system`, () => {
            const modulePath = '../../src/env/ci-detection';

            let { detectCISystem } = mock.reRequire(modulePath);

            assert.equal(detectCISystem(), null);

            process.env[CIVariable.name] = CIVariable.value;

            detectCISystem = mock.reRequire(modulePath).detectCISystem;

            assert.equal(detectCISystem(), CIVariable.CISystem);
        });
    }
});

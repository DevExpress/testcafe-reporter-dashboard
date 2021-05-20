import assert from 'assert';

import { CI_INFO_VARIABLES } from '../data/ci-variables';
import { clearCIInfoVariables, restoreCIInfoVariables } from '../mocks';

describe('getCIInfo', () => {
    beforeEach(clearCIInfoVariables);

    afterEach(restoreCIInfoVariables);

    CI_INFO_VARIABLES.forEach(CI => {
        it(`should give commit info from ${CI.CISystem}`, () => {
            for (const variable in CI.variables)
                process.env[variable] = CI.variables[variable];

            assert.deepEqual(CI.getter(), CI.expectedCIInfo);
        });
    });
});

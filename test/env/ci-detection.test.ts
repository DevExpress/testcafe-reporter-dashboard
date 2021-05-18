import assert from 'assert';
import mock from 'mock-require';

const CI_VARIABLES = [
    { CISystem: 'GithubActions', name: 'GITHUB_ACTIONS', value: 'true' },
    { CISystem: 'BitbucketPipelines', name: 'BITBUCKET_BUILD_NUMBER', value: '0' }
];

describe('CI detection', () => {
    const originalVariables = {};

    for (const CIVariable of CI_VARIABLES) {
        originalVariables[CIVariable.name] = process.env[CIVariable.name];

        delete process.env[CIVariable.name];
    };

    beforeEach(() => {
        for (const CIVariable of CI_VARIABLES)
            delete process.env[CIVariable.name];
    });

    afterEach(() => {
        for (const CIVariable of CI_VARIABLES)
            process.env[CIVariable.name] = originalVariables[CIVariable.name];
    });


    for (const CIVariable of CI_VARIABLES) {
        console.log(CIVariable.name);
        console.log(process.env[CIVariable.name]);

        it(`Should detect ${CIVariable.CISystem} CI system`, () => {
            const modulePath = '../../src/env/ci-detection';

            let { detectCISystem } = mock.reRequire(modulePath);

            assert.equal(detectCISystem(), null);

            process.env[CIVariable.name] = CIVariable.value;

            detectCISystem = mock.reRequire(modulePath).detectCISystem;

            console.log(process.env[CIVariable.name]);
            assert.equal(detectCISystem(), CIVariable.CISystem);

            console.log(CIVariable.name);
            console.log(process.env[CIVariable.name]);
        });
    }
});

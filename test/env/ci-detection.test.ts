import assert from 'assert';
import mock from 'mock-require';
// import { CISystems } from '../../src/env/ci-detection';

const CI_VARIABLES = [
    { CISystem: 'GithubActions', name: 'GITHUB_ACTIONS', value: 'true' },
    { CISystem: 'BitbucketPipelines', name: 'BITBUCKET_BUILD_NUMBER', value: '0' }
];

describe('CI detection', () => {
    let originalVariables = {};

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


    // const CIVariable = CI_VARIABLES[0];
    for (const CIVariable of CI_VARIABLES) {
        console.log(CIVariable.name);
        console.log(process.env[CIVariable.name]);

        it.only(`Should detect ${CIVariable.CISystem} CI system`, () => {
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


    // it('Should detect Github Actions', () => {
    //     const originalValue = process.env.GITHUB_ACTIONS;

    //     process.env.GITHUB_ACTIONS = '';

    //     let { isGithubActions } = mock.reRequire(modulePath);

    //     assert.equal(isGithubActions, false);

    //     process.env.GITHUB_ACTIONS = 'true';

    //     isGithubActions = mock.reRequire(modulePath).isGithubActions;

    //     assert.equal(isGithubActions, true);

    //     process.env.GITHUB_ACTIONS = originalValue;
    // });
});

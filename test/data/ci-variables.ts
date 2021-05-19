import { CISystems } from '../../src/env/ci-detection';

export const CI_VARIABLES = [
    { CISystem: CISystems.githubActions, name: 'GITHUB_ACTIONS', value: 'true' },
    { CISystem: CISystems.bitbucketPipelines, name: 'BITBUCKET_BUILD_NUMBER', value: '0' },
    { CISystem: CISystems.jenkins, name: 'JENKINS_HOME', value: '/home/jenkins' },
    { CISystem: CISystems.jenkins, name: 'JENKINS_URL', value: 'http://localhost:8080' }
];

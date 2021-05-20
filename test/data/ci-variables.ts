import { CISystems } from '../../src/env/ci-detection';
import { getAppVeyorInfo } from '../../src/env/app-veyor';
import { getBambooInfo } from '../../src/env/bamboo';
import { getBitbucketPipelinesInfo } from '../../src/env/bitbucket-pipelines';
import { getCircleCIInfo } from '../../src/env/circle-ci';
import { getJenkinsInfo } from '../../src/env/jenkins';
import { getAWSCodeBuildInfo } from '../../src/env/aws-code-build';

const commitSHA  = 'commit sha';
const author     = 'Luke';
const branchName = 'branchName';

export const CI_DETECTION_VARIABLES = [
    { CISystem: CISystems.appVeyor, name: 'APPVEYOR', value: 'true' },
    { CISystem: CISystems.awsCodeBuild, name: 'CODEBUILD_BUILD_ID', value: '123' },
    { CISystem: CISystems.bamboo, name: 'bamboo_buildNumber', value: '123' },
    { CISystem: CISystems.bitbucketPipelines, name: 'BITBUCKET_BUILD_NUMBER', value: '0' },
    { CISystem: CISystems.circleCI, name: 'CIRCLECI', value: 'true' },
    { CISystem: CISystems.githubActions, name: 'GITHUB_ACTIONS', value: 'true' },
    { CISystem: CISystems.jenkins, name: 'JENKINS_HOME', value: '/home/jenkins' },
    { CISystem: CISystems.jenkins, name: 'JENKINS_URL', value: 'http://localhost:8080' }
];

export const CI_INFO_VARIABLES = [
    {
        CISystem:  CISystems.appVeyor,
        getter:    getAppVeyorInfo,
        variables: {
            APPVEYOR_REPO_COMMIT:        commitSHA,
            APPVEYOR_REPO_BRANCH:        branchName,
            APPVEYOR_REPO_COMMIT_AUTHOR: author
        },
        expectedCIInfo: { commitSHA, branchName, author }
    },
    {
        CISystem:  CISystems.awsCodeBuild,
        getter:    getAWSCodeBuildInfo,
        variables: {
            CODEBUILD_RESOLVED_SOURCE_VERSION: commitSHA
        },
        expectedCIInfo: { commitSHA }
    },
    {
        CISystem:  CISystems.bamboo,
        getter:    getBambooInfo,
        variables: {
            'bamboo_planRepository_revision': commitSHA,
            'bamboo_planRepository_branch':   branchName,
            'bamboo_planRepository_username': author
        },
        expectedCIInfo: { commitSHA, branchName, author }
    },
    {
        CISystem:  CISystems.bitbucketPipelines,
        getter:    getBitbucketPipelinesInfo,
        variables: {
            BITBUCKET_COMMIT: commitSHA,
            BITBUCKET_BRANCH: branchName
        },
        expectedCIInfo: { commitSHA, branchName }
    },
    {
        CISystem:  CISystems.circleCI,
        getter:    getCircleCIInfo,
        variables: {
            CIRCLE_SHA1:     commitSHA,
            CIRCLE_BRANCH:   branchName,
            CIRCLE_USERNAME: author
        },
        expectedCIInfo: { commitSHA, branchName, author }
    },
    {
        CISystem:  CISystems.jenkins,
        getter:    getJenkinsInfo,
        variables: {
            GIT_COMMIT:      commitSHA,
            GIT_BRANCH:      branchName,
            GIT_AUTHOR_NAME: author
        },
        expectedCIInfo: { commitSHA, branchName, author }
    }
];

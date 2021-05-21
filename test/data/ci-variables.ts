import { CISystems } from '../../src/env/ci-detection';

const commitSHA  = 'commit sha';
const author     = 'Luke';
const branchName = 'branchName';

export const CI_DETECTION_VARIABLES = [
    { CISystem: CISystems.appVeyor, name: 'APPVEYOR', value: 'true' },
    { CISystem: CISystems.awsCodeBuild, name: 'CODEBUILD_BUILD_ID', value: '123' },
    { CISystem: CISystems.azure, name: 'AZURE_HTTP_USER_AGENT', value: '123' },
    { CISystem: CISystems.bamboo, name: 'bamboo_buildNumber', value: '123' },
    { CISystem: CISystems.bitbucketPipelines, name: 'BITBUCKET_BUILD_NUMBER', value: '0' },
    { CISystem: CISystems.buddy, name: 'BUDDY', value: 'true' },
    { CISystem: CISystems.buildkite, name: 'BUILDKITE', value: 'true' },
    { CISystem: CISystems.circleCI, name: 'CIRCLECI', value: 'true' },
    { CISystem: CISystems.codeFresh, name: 'CF_BUILD_ID', value: '123' },
    { CISystem: CISystems.codeship, name: 'CODESHIP', value: 'true' },
    { CISystem: CISystems.codeship, name: 'CI_NAME', value: 'codeship' },
    { CISystem: CISystems.concourse, name: 'CONCOURSE_', value: '123' },
    { CISystem: CISystems.drone, name: 'DRONE', value: 'true' },
    { CISystem: CISystems.githubActions, name: 'GITHUB_ACTIONS', value: 'true' },
    { CISystem: CISystems.gitlab, name: 'GITLAB_CI', value: 'true' },
    { CISystem: CISystems.goCD, name: 'GO_JOB_NAME', value: 'build' },
    { CISystem: CISystems.googleCloud, name: 'GCP_PROJECT', value: 'google cloud project' },
    { CISystem: CISystems.jenkins, name: 'JENKINS_HOME', value: '/home/jenkins' },
    { CISystem: CISystems.jenkins, name: 'JENKINS_URL', value: 'http://localhost:8080' },
    { CISystem: CISystems.layerCI, name: 'LAYERCI', value: 'true' },
    { CISystem: CISystems.netlify, name: 'NETLIFY', value: 'true' },
    { CISystem: CISystems.semaphore, name: 'SEMAPHORE', value: 'true' },
    { CISystem: CISystems.shippable, name: 'SHIPPABLE', value: 'true' },
    { CISystem: CISystems.teamCity, name: 'TEAMCITY_VERSION', value: 'true' },
    { CISystem: CISystems.teamFoundation, name: 'TF_BUILD_BUILDNUMBER', value: '123' },
    { CISystem: CISystems.travis, name: 'TRAVIS', value: 'true' },
    { CISystem: CISystems.wercker, name: 'WERCKER', value: 'true' }
];

export const CI_INFO_VARIABLES = [
    {
        CISystem:  CISystems.appVeyor,
        variables: {
            APPVEYOR_REPO_COMMIT:        commitSHA,
            APPVEYOR_REPO_BRANCH:        branchName,
            APPVEYOR_REPO_COMMIT_AUTHOR: author
        },
        expectedCIInfo: { commitSHA, branchName, author }
    },
    {
        CISystem:  CISystems.awsCodeBuild,
        variables: {
            CODEBUILD_RESOLVED_SOURCE_VERSION: commitSHA
        },
        expectedCIInfo: { commitSHA }
    },
    {
        CISystem:  CISystems.azure,
        variables: {
            BUILD_SOURCEVERSION:       commitSHA,
            BUILD_SOURCEBRANCHNAME:    branchName,
            BUILD_SOURCEVERSIONAUTHOR: author
        },
        expectedCIInfo: { commitSHA, branchName, author }
    },
    {
        CISystem:  CISystems.bamboo,
        variables: {
            'bamboo_planRepository_revision': commitSHA,
            'bamboo_planRepository_branch':   branchName,
            'bamboo_planRepository_username': author
        },
        expectedCIInfo: { commitSHA, branchName, author }
    },
    {
        CISystem:  CISystems.bitbucketPipelines,
        variables: {
            BITBUCKET_COMMIT: commitSHA,
            BITBUCKET_BRANCH: branchName
        },
        expectedCIInfo: { commitSHA, branchName }
    },
    {
        CISystem:  CISystems.buddy,
        variables: {
            BUDDY_EXECUTION_REVISION: commitSHA,
            BUDDY_EXECUTION_BRANCH:   branchName,
            BUDDY_INVOKER_NAME:       author
        },
        expectedCIInfo: { commitSHA, branchName, author }
    },
    {
        CISystem:  CISystems.buildkite,
        variables: {
            BUILDKITE_COMMIT:        commitSHA,
            BUILDKITE_BRANCH:        branchName,
            BUILDKITE_BUILD_CREATOR: author
        },
        expectedCIInfo: { commitSHA, branchName, author }
    },
    {
        CISystem:  CISystems.circleCI,
        variables: {
            CIRCLE_SHA1:     commitSHA,
            CIRCLE_BRANCH:   branchName,
            CIRCLE_USERNAME: author
        },
        expectedCIInfo: { commitSHA, branchName, author }
    },
    {
        CISystem:  CISystems.codeFresh,
        variables: {
            CF_REVISION:      commitSHA,
            CF_BRANCH:        branchName,
            CF_COMMIT_AUTHOR: author
        },
        expectedCIInfo: { commitSHA, branchName, author }
    },
    {
        CISystem:  CISystems.codeship,
        variables: {
            CI_COMMIT_ID:      commitSHA,
            CI_BRANCH:         branchName,
            CI_COMMITTER_NAME: author
        },
        expectedCIInfo: { commitSHA, branchName, author }
    },
    {
        CISystem:  CISystems.drone,
        variables: {
            DRONE_COMMIT_SHA:    commitSHA,
            DRONE_COMMIT_BRANCH: branchName,
            DRONE_COMMIT_AUTHOR: author
        },
        expectedCIInfo: { commitSHA, branchName, author }
    },
    {
        CISystem:  CISystems.gitlab,
        variables: {
            CI_COMMIT_SHA:      commitSHA,
            CI_COMMIT_REF_NAME: branchName,
            GITLAB_USER_NAME:   author
        },
        expectedCIInfo: { commitSHA, branchName, author }
    },
    {
        CISystem:  CISystems.googleCloud,
        variables: {
            COMMIT_SHA:  commitSHA,
            BRANCH_NAME: branchName
        },
        expectedCIInfo: { commitSHA, branchName }
    },
    {
        CISystem:  CISystems.jenkins,
        variables: {
            GIT_COMMIT:      commitSHA,
            GIT_BRANCH:      branchName,
            GIT_AUTHOR_NAME: author
        },
        expectedCIInfo: { commitSHA, branchName, author }
    },
    {
        CISystem:  CISystems.layerCI,
        variables: {
            GIT_COMMIT:     commitSHA,
            LAYERCI_BRANCH: branchName
        },
        expectedCIInfo: { commitSHA, branchName }
    },
    {
        CISystem:  CISystems.netlify,
        variables: {
            COMMIT_REF: commitSHA,
            BRANCH:     branchName
        },
        expectedCIInfo: { commitSHA, branchName }
    },
    {
        CISystem:  CISystems.semaphore,
        variables: {
            SEMAPHORE_GIT_SHA:    commitSHA,
            SEMAPHORE_GIT_BRANCH: branchName
        },
        expectedCIInfo: { commitSHA, branchName }
    },
    {
        CISystem:  CISystems.shippable,
        variables: {
            COMMIT:    commitSHA,
            BRANCH:    branchName,
            COMMITTER: author
        },
        expectedCIInfo: { commitSHA, branchName, author }
    },
    {
        CISystem:  CISystems.teamFoundation,
        variables: {
            BUILD_SOURCEVERSION:       commitSHA,
            BUILD_SOURCEBRANCHNAME:    branchName,
            BUILD_SOURCEVERSIONAUTHOR: author
        },
        expectedCIInfo: { commitSHA, branchName, author }
    },
    {
        CISystem:  CISystems.travis,
        variables: {
            TRAVIS_COMMIT: commitSHA,
            TRAVIS_BRANCH: branchName
        },
        expectedCIInfo: { commitSHA, branchName }
    }
];

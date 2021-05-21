import { CISystems } from './ci-detection';
import { getGithubActionsInfo } from './github-actions';

const { env } = process;

export const CIInfoProviders = {
    [CISystems.appVeyor]: () => ({
        commitSHA:  env.APPVEYOR_REPO_COMMIT,
        branchName: env.APPVEYOR_REPO_BRANCH,
        author:     env.APPVEYOR_REPO_COMMIT_AUTHOR
    }),
    [CISystems.awsCodeBuild]: () => ({
        commitSHA: env.CODEBUILD_RESOLVED_SOURCE_VERSION
    }),
    [CISystems.azure]: () => ({
        commitSHA:  env.BUILD_SOURCEVERSION,
        branchName: env.BUILD_SOURCEBRANCHNAME,
        author:     env.BUILD_SOURCEVERSIONAUTHOR
    }),
    [CISystems.bamboo]: () => ({
        commitSHA:  env.bamboo_planRepository_revision,
        branchName: env.bamboo_planRepository_branch,
        author:     env.bamboo_planRepository_username
    }),
    [CISystems.bitbucketPipelines]: () => ({
        commitSHA:  env.BITBUCKET_COMMIT,
        branchName: env.BITBUCKET_BRANCH
    }),
    [CISystems.buddy]: () => ({
        commitSHA:  env.BUDDY_EXECUTION_REVISION,
        branchName: env.BUDDY_EXECUTION_BRANCH,
        author:     env.BUDDY_INVOKER_NAME
    }),
    [CISystems.buildkite]: () => ({
        commitSHA:  env.BUILDKITE_COMMIT,
        branchName: env.BUILDKITE_BRANCH,
        author:     env.BUILDKITE_BUILD_CREATOR
    }),
    [CISystems.circleCI]: () => ({
        commitSHA:  env.CIRCLE_SHA1,
        branchName: env.CIRCLE_BRANCH,
        author:     env.CIRCLE_USERNAME
    }),
    [CISystems.codeFresh]: () => ({
        commitSHA:  env.CF_REVISION,
        branchName: env.CF_BRANCH,
        author:     env.CF_COMMIT_AUTHOR
    }),
    [CISystems.codeship]: () => ({
        commitSHA:  env.CI_COMMIT_ID,
        branchName: env.CI_BRANCH,
        author:     env.CI_COMMITTER_NAME
    }),
    [CISystems.drone]: () => ({
        commitSHA:  env.DRONE_COMMIT_SHA,
        branchName: env.DRONE_COMMIT_BRANCH,
        author:     env.DRONE_COMMIT_AUTHOR
    }),
    [CISystems.githubActions]: getGithubActionsInfo,
    [CISystems.gitlab]:        () => ({
        commitSHA:  env.CI_COMMIT_SHA,
        branchName: env.CI_COMMIT_REF_NAME,
        author:     env.GITLAB_USER_NAME
    }),
    [CISystems.googleCloud]: () => ({
        commitSHA:  env.COMMIT_SHA,
        branchName: env.BRANCH_NAME
    }),
    [CISystems.jenkins]: () => ({
        commitSHA:  env.GIT_COMMIT,
        branchName: env.GIT_BRANCH,
        author:     env.GIT_AUTHOR_NAME || env.GIT_COMMITTER_NAME
    }),
    [CISystems.layerCI]: () => ({
        commitSHA:  env.GIT_COMMIT,
        branchName: env.LAYERCI_BRANCH
    }),
    [CISystems.netlify]: () => ({
        commitSHA:  env.COMMIT_REF,
        branchName: env.BRANCH
    }),
    [CISystems.semaphore]: () => ({
        commitSHA:  env.SEMAPHORE_GIT_SHA,
        branchName: env.SEMAPHORE_GIT_BRANCH
    }),
    [CISystems.shippable]: () => ({
        commitSHA:  env.COMMIT,
        branchName: env.BRANCH,
        author:     env.COMMITTER
    }),
    [CISystems.teamFoundation]: () => ({
        commitSHA:  env.BUILD_SOURCEVERSION,
        branchName: env.BUILD_SOURCEBRANCHNAME,
        author:     env.BUILD_SOURCEVERSIONAUTHOR
    }),
    [CISystems.travis]: () => ({
        commitSHA:  env.TRAVIS_COMMIT,
        branchName: env.TRAVIS_BRANCH
    })
};

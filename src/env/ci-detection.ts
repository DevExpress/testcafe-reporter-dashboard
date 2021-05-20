import { parseBooleanVariable } from './utils';

const AWS_CODE_BUILD_RE = /^CODEBUILD_/;

export enum CISystems {
    appVeyor = 'AppVeyor',
    awsCodeBuild = 'AWSCodeBuild',
    bamboo = 'Bamboo',
    bitbucketPipelines = 'BitbucketPipelines',
    circleCI = 'Circle CI',
    githubActions = 'GithubActions',
    jenkins = 'Jenkins'
};

export function detectCISystem () {
    const { env } = process;

    const ciDetectors = {
        [CISystems.appVeyor]:           parseBooleanVariable(env.APPVEYOR),
        [CISystems.awsCodeBuild]:       Object.keys(env).find(key => AWS_CODE_BUILD_RE.test(key) && env[key]),
        [CISystems.bamboo]:             env.bamboo_buildNumber,
        [CISystems.bitbucketPipelines]: env.BITBUCKET_BUILD_NUMBER,
        [CISystems.circleCI]:           parseBooleanVariable(env.CIRCLECI),
        [CISystems.githubActions]:      parseBooleanVariable(env.GITHUB_ACTIONS),
        [CISystems.jenkins]:            env.JENKINS_HOME || env.JENKINS_URL,
    };

    for (const ciSystem of Object.values(CISystems)) {
        if (ciDetectors[ciSystem])
            return ciSystem;
    };

    return null;
};

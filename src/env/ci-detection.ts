import { parseBooleanVariable } from './utils';

export enum CISystems {
    bitbucketPipelines = 'BitbucketPipelines',
    circleCI = 'Circle CI',
    githubActions = 'GithubActions',
    jenkins = 'Jenkins'
};

export function detectCISystem () {
    const ciDetectors = {
        [CISystems.bitbucketPipelines]: process.env.BITBUCKET_BUILD_NUMBER,
        [CISystems.circleCI]:           parseBooleanVariable(process.env.CIRCLECI),
        [CISystems.githubActions]:      parseBooleanVariable(process.env.GITHUB_ACTIONS),
        [CISystems.jenkins]:            process.env.JENKINS_HOME || process.env.JENKINS_URL,
    };

    for (const ciSystem of Object.values(CISystems)) {
        if (ciDetectors[ciSystem])
            return ciSystem;
    };

    return null;
};

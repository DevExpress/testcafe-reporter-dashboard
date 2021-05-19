import { parseBooleanVariable } from './utils';

export enum CISystems {
    githubActions = 'GithubActions',
    bitbucketPipelines = 'BitbucketPipelines',
    jenkins = 'Jenkins'
};

export function detectCISystem () {
    const ciDetectors = {
        [CISystems.githubActions]:      parseBooleanVariable(process.env.GITHUB_ACTIONS),
        [CISystems.bitbucketPipelines]: process.env.BITBUCKET_BUILD_NUMBER,
        [CISystems.jenkins]:            process.env.JENKINS_HOME || process.env.JENKINS_URL
    };

    for (const ciSystem of Object.values(CISystems)) {
        if (ciDetectors[ciSystem])
            return ciSystem;
    };

    return null;
};

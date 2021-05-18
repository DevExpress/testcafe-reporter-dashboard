import { parseBooleanVariable } from './utils';

export enum CISystems {
    githubActions = 'GithubActions',
    bitbucketPipelines = 'BitbucketPipelines'
};

export function detectCISystem () {
    const ciDetectors = {
        [CISystems.githubActions]:      parseBooleanVariable(process.env.GITHUB_ACTIONS),
        [CISystems.bitbucketPipelines]: process.env.BITBUCKET_BUILD_NUMBER
    };

    for (const ciSystem of Object.values(CISystems)) {
        if (ciDetectors[ciSystem])
            return ciSystem;
    };

    return null;
};

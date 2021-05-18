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

    let result;

    Object.values(CISystems).forEach(ciSystem => {
        if (ciDetectors[ciSystem]) {
            result = ciSystem;
        }
    });

    return result;
};

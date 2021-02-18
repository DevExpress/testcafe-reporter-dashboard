import { getAuthorByCommit } from './utils';
import {
    isAppveyor,
    isCircleCi,
    isGithubActions,
    isGitLab,
    isJenkins,
    isTeamcity,
    isTravis
} from './ci-detection';

const { env } = process;

export async function getCommitAuthor (): Promise<string> {
    let author = '';

    if (isCircleCi)
        author = env.CIRCLE_USERNAME;
    else if (isTravis)
        author = await getAuthorByCommit(env.TRAVIS_COMMIT);
    else if (isJenkins)
        author = await getAuthorByCommit(env.GIT_COMMIT);
    else if (isGitLab)
        author = env.GITLAB_USER_NAME;
    else if (isGithubActions)
        author = await getAuthorByCommit(env.GITHUB_SHA);
    else if (isAppveyor)
        author = env.APPVEYOR_REPO_COMMIT_AUTHOR;
    else if (isTeamcity)
        author = await getAuthorByCommit('-1');

    return author;
}

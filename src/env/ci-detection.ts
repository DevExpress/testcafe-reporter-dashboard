import { parseBooleanVariable } from './utils';

const { env } = process;

export const isGithubActions = parseBooleanVariable(env.GITHUB_ACTIONS);

export const isBitbucketPipelines = env.BITBUCKET_BUILD_NUMBER !== void 0;
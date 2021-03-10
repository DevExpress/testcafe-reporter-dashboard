import { parseBooleanVariable } from './utils';

const { env } = process;

export const isGithubActions = parseBooleanVariable(env.GITHUB_ACTIONS);

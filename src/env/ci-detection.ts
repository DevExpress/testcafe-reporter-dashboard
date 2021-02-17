import { parseBooleanVariable } from './utils';

const { env } = process;

export const isCircleCi = parseBooleanVariable(env.CIRCLECI);
export const isTravis = parseBooleanVariable(env.TRAVIS);
export const isJenkins = parseBooleanVariable(
    env.JENKINS_HOME || env.JENKINS_URL ||
    env.HUDSON_URL || env.HUDSON_HOME
);
export const isGitLab = parseBooleanVariable(env.GITLAB_CI);
export const isGithubActions = parseBooleanVariable(env.GITHUB_ACTIONS);
export const isAppveyor = parseBooleanVariable(env.APPVEYOR);
export const isTeamcity = parseBooleanVariable(env.TEAMCITY_VERSION);

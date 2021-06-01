import { parseBooleanVariable } from './utils';

const AWS_CODE_BUILD_RE = /^CODEBUILD_/;
const CONCOURSE_RE      = /^CONCOURSE_/;
const CODESHIP_CI_NAME  = 'codeship';

export enum CISystems {
    appVeyor = 'AppVeyor',
    awsCodeBuild = 'AWSCodeBuild',
    azure = 'Azure',
    bamboo = 'Bamboo',
    bitbucketPipelines = 'BitbucketPipelines',
    buddy = 'Buddy',
    buildkite = 'Buildkite',
    circleCI = 'CircleCI',
    codeFresh = 'CodeFresh',
    codeship = 'Codeship',
    concourse = 'Concourse',
    drone = 'Drone',
    gitlab = 'GitLab',
    goCD = 'GoCD',
    googleCloud = 'GoogleCloud',
    githubActions = 'GithubActions',
    jenkins = 'Jenkins',
    layerCI = 'LayerCI',
    netlify = 'Netlify',
    semaphore = 'Semaphore',
    shippable = 'Shippable',
    teamCity = 'TeamCity',
    teamFoundation = 'TeamFoundation',
    travis = 'Travis',
    wercker = 'Wercker'
};

export function detectCISystem () {
    const { env } = process;

    const ciDetectors = {
        [CISystems.appVeyor]:           parseBooleanVariable(env.APPVEYOR),
        [CISystems.awsCodeBuild]:       Object.keys(env).find(key => AWS_CODE_BUILD_RE.test(key) && env[key]),
        [CISystems.azure]:              env.AZURE_HTTP_USER_AGENT,
        [CISystems.bamboo]:             env.bamboo_buildNumber,
        [CISystems.bitbucketPipelines]: env.BITBUCKET_BUILD_NUMBER,
        [CISystems.buddy]:              parseBooleanVariable(env.BUDDY),
        [CISystems.buildkite]:          parseBooleanVariable(env.BUILDKITE),
        [CISystems.circleCI]:           parseBooleanVariable(env.CIRCLECI),
        [CISystems.codeFresh]:          env.CF_BUILD_ID,
        [CISystems.codeship]:           parseBooleanVariable(env.CODESHIP) || env.CI_NAME && env.CI_NAME.toLowerCase() === CODESHIP_CI_NAME,
        [CISystems.concourse]:          Object.keys(env).find(key => CONCOURSE_RE.test(key)),
        [CISystems.drone]:              parseBooleanVariable(env.DRONE),
        [CISystems.githubActions]:      parseBooleanVariable(env.GITHUB_ACTIONS),
        [CISystems.gitlab]:             parseBooleanVariable(env.GITLAB_CI),
        [CISystems.goCD]:               env.GO_JOB_NAME,
        [CISystems.googleCloud]:        env.GCP_PROJECT,
        [CISystems.jenkins]:            env.JENKINS_HOME || env.JENKINS_URL,
        [CISystems.layerCI]:            parseBooleanVariable(env.LAYERCI),
        [CISystems.netlify]:            parseBooleanVariable(env.NETLIFY),
        [CISystems.semaphore]:          parseBooleanVariable(env.SEMAPHORE),
        [CISystems.shippable]:          parseBooleanVariable(env.SHIPPABLE),
        [CISystems.teamCity]:           parseBooleanVariable(env.TEAMCITY_VERSION),
        [CISystems.teamFoundation]:     env.TF_BUILD_BUILDNUMBER,
        [CISystems.travis]:             parseBooleanVariable(env.TRAVIS),
        [CISystems.wercker]:            parseBooleanVariable(env.WERCKER)
    };

    for (const ciSystem of Object.values(CISystems)) {
        if (ciDetectors[ciSystem])
            return ciSystem;
    };

    return null;
};

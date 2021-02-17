import { parseBooleanVariable } from './utils';

const { env } = process;

export const ENABLE_LOG             = parseBooleanVariable(env.ENABLE_LOG);
export const TESTCAFE_DASHBOARD_URL = env.TESTCAFE_DASHBOARD_URL || 'https://ddev.testcafe.io';

export const NO_SCREENSHOT_UPLOAD = parseBooleanVariable(env.NO_SCREENSHOT_UPLOAD);
export const NO_VIDEO_UPLOAD      = parseBooleanVariable(env.NO_VIDEO_UPLOAD);

export const TESTCAFE_DASHBOARD_AUTHENTICATION_TOKEN = env.TESTCAFE_DASHBOARD_AUTHENTICATION_TOKEN;
export const TESTCAFE_DASHBOARD_BUILD_ID: string | undefined = env.TESTCAFE_DASHBOARD_BUILD_ID;

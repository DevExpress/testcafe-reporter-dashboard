import { parseBooleanVariable } from './utils';

export const ENABLE_LOG             = parseBooleanVariable(process.env.ENABLE_LOG);
export const TESTCAFE_DASHBOARD_URL = process.env.TESTCAFE_DASHBOARD_URL || 'https://ddev.testcafe.io';

export const NO_SCREENSHOT_UPLOAD = parseBooleanVariable(process.env.NO_SCREENSHOT_UPLOAD);
export const NO_VIDEO_UPLOAD      = parseBooleanVariable(process.env.NO_VIDEO_UPLOAD);

export const TESTCAFE_DASHBOARD_AUTHENTICATION_TOKEN = process.env.TESTCAFE_DASHBOARD_AUTHENTICATION_TOKEN;
export const TESTCAFE_DASHBOARD_BUILD_ID: string | undefined = process.env.TESTCAFE_DASHBOARD_BUILD_ID;

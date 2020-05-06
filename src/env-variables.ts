export const ENABLE_LOG             = process.env.ENABLE_LOG;
export const TESTCAFE_DASHBOARD_URL = process.env.TESTCAFE_DASHBOARD_URL;

export const ENABLE_SCREENSHOTS_UPLOAD = process.env.ENABLE_SCREENSHOTS_UPLOAD === void 0 || !!process.env.ENABLE_SCREENSHOTS_UPLOAD;
export const ENABLE_VIDEO_UPLOAD       = process.env.ENABLE_VIDEO_UPLOAD === void 0 || !!process.env.ENABLE_VIDEO_UPLOAD;

export const TESTCAFE_DASHBOARD_AUTHENTICATION_TOKEN = process.env.TESTCAFE_DASHBOARD_AUTHENTICATION_TOKEN;
export const BUILD_ID: string | undefined = process.env.BUILD_ID;

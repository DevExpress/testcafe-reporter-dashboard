function parseBooleanVariable (value): boolean {
    return value === 'false' ? false : !!value;
}

export const ENABLE_LOG             = process.env.ENABLE_LOG;
export const TESTCAFE_DASHBOARD_URL = process.env.TESTCAFE_DASHBOARD_URL;

export const DISABLE_SCREENSHOTS_UPLOAD = parseBooleanVariable(process.env.DISABLE_SCREENSHOTS_UPLOAD);
export const DISABLE_VIDEO_UPLOAD       = parseBooleanVariable(process.env.DISABLE_VIDEO_UPLOAD);

export const TESTCAFE_DASHBOARD_AUTHENTICATION_TOKEN = process.env.TESTCAFE_DASHBOARD_AUTHENTICATION_TOKEN;
export const BUILD_ID: string | undefined = process.env.BUILD_ID;

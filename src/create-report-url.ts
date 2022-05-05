import { decodeAuthenticationToken } from './validate-settings';


type ReportPathParts = {
    projectId: string;
    reportId: string;
};

const REPORT_PATH: TemplateFunction = ({ projectId, reportId }: ReportPathParts): string => `runs/${projectId}/${reportId}`;
const HTTP_URL: TemplateFunction    = (url: string): string => `http://${url}`;

function createURL (...args: ConstructorParameters<typeof URL>): string {
    return String(new URL(...args));
}

function ensureHTTPProtocol (url: string): string {
    try {
        return createURL(url);
    }
    catch (error) {
        return createURL(HTTP_URL(url));
    }
}

export default function (reportId: string, dashboardUrl: string, authenticationToken: string): string {
    const { projectId } = decodeAuthenticationToken(authenticationToken);

    const reportPath = REPORT_PATH({ projectId, reportId: encodeURIComponent(reportId) });

    return createURL(reportPath, ensureHTTPProtocol(dashboardUrl));
}

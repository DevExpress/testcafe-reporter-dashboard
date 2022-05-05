import { decodeAuthenticationToken } from './validate-settings';


type ReportPathParts = {
    projectId: string;
    reportId: string;
};

const REPORT_PATH = ({ projectId, reportId }: ReportPathParts) => `runs/${projectId}/${reportId}`;
const HTTP_URL    = (url: string) => `http://${url}`;

function createURL (...args: ConstructorParameters<typeof URL>) {
    return String(new URL(...args));
}

function ensureHTTPProtocol (url: string) {
    try {
        return createURL(url);
    }
    catch (error) {
        return createURL(HTTP_URL(url));
    }
}

export default function (reportId: string, dashboardUrl: string, authenticationToken: string) {
    const { projectId } = decodeAuthenticationToken(authenticationToken);

    const reportPath = REPORT_PATH({ projectId, reportId: encodeURIComponent(reportId) });

    return createURL(reportPath, ensureHTTPProtocol(dashboardUrl));
}

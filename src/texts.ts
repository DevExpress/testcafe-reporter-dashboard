import { format } from 'util';
import  { TESTCAFE_DASHBOARD_URL } from './env-variables';

const REPORT_URL_MESSAGE = `Task execution report is available by the following URL: ${TESTCAFE_DASHBOARD_URL}/details/%s`;

export function createReportUrlMessage (reportId: string) : string {
    return format(REPORT_URL_MESSAGE, reportId);
}

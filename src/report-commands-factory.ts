import { AggregateCommandType, AggregateNames } from './types/internal/';
import { TaskStartArgs, TestStartArgs, TaskDoneArgs, TestDoneArgs, ReportWarningArgs } from './types/';
import Transport from './transport';

export default function reportCommandsFactory (reportId: string, transport: Transport) {
    async function sendReportCommand (
        type: AggregateCommandType,
        payload: Record<string, unknown>
    ): Promise<void> {
        return transport.sendResolveCommand({
            aggregateId:   reportId,
            aggregateName: AggregateNames.Run,
            type,
            payload
        });
    }

    return {
        sendTaskStartCommand (payload: TaskStartArgs): Promise<void> {
            return sendReportCommand(AggregateCommandType.reportTaskStart, payload);
        },
        sendTestStartCommand (payload: TestStartArgs) {
            return Promise.resolve(payload);
        },
        sendTestDoneCommand (payload: TestDoneArgs): Promise<void> {
            return sendReportCommand(AggregateCommandType.reportTestDone, payload);
        },
        sendTaskDoneCommand (payload: TaskDoneArgs): Promise<void> {
            return sendReportCommand(AggregateCommandType.reportTaskDone, payload);
        },
        sendReportWarningsCommand (payload: ReportWarningArgs): Promise<void> {
            return sendReportCommand(AggregateCommandType.reportWarnings, payload);
        }
    };
};

import { AggregateCommandType, AggregateNames } from './types/dashboard';
import { TaskStartArgs, TestStartArgs, TestDoneArgs, TaskDoneArgs } from './types/command-args';
import Transport from './transport';

export default function reportCommandsFactory (reportId: string, transport: Transport) {
    async function sendReportCommand (type: AggregateCommandType, payload: Record<string, any>): Promise<void> {
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
        sendTestStartCommand (payload: TestStartArgs): Promise<void> {
            return sendReportCommand(AggregateCommandType.reportTestStart, payload);
        },
        sendTestDoneCommand (payload: TestDoneArgs): Promise<void> {
            return sendReportCommand(AggregateCommandType.reportTestDone, payload);
        },
        sendTaskDoneCommand (payload: TaskDoneArgs): Promise<void> {
            return sendReportCommand(AggregateCommandType.reportTaskDone, payload);
        }
    };
};

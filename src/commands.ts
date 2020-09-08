import { AggregateCommandType, AggregateNames, TaskStartArgs, TestStartArgs, TestDoneArgs, TaskDoneArgs } from './types/dashboard';
import sendResolveCommand from './send-resolve-command';

async function sendReportCommand (id: string, type: AggregateCommandType, payload: Record<string, any>): Promise<void> {
    return sendResolveCommand({
        aggregateId:   id,
        aggregateName: AggregateNames.Run,
        type,
        payload
    });
}

export async function sendTaskStartCommand (id: string, payload: TaskStartArgs): Promise<void> {
    return sendReportCommand(id, AggregateCommandType.reportTaskStart, payload);
}

export async function sendTestStartCommand (id: string, payload: TestStartArgs): Promise<void> {
    return sendReportCommand(id, AggregateCommandType.reportTestStart, payload);
}

export async function sendTestDoneCommand (id: string, payload: TestDoneArgs): Promise<void> {
    return sendReportCommand(id, AggregateCommandType.reportTestDone, payload);
}

export async function sendTaskDoneCommand (id: string, payload: TaskDoneArgs): Promise<void> {
    return sendReportCommand(id, AggregateCommandType.reportTaskDone, payload);
}

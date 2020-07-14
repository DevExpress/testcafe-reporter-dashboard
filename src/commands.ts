import { CommandTypes, AggregateNames, TaskStartArgs, TestStartArgs, TestDoneArgs, TaskDoneArgs } from './types/dashboard';
import sendResolveCommand from './send-resolve-command';

async function sendReportCommand (id: string, type: CommandTypes, payload: Record<string, any>): Promise<void> {
    return sendResolveCommand({
        aggregateId:   id,
        aggregateName: AggregateNames.Run,
        type,
        payload
    });
}

export async function sendTaskStartCommand (id: string, payload: TaskStartArgs): Promise<void> {
    return sendReportCommand(id, CommandTypes.reportTaskStart, payload);
}

export async function sendTestStartCommand (id: string, payload: TestStartArgs): Promise<void> {
    return sendReportCommand(id, CommandTypes.reportTestStart, payload);
}

export async function sendTestDoneCommand (id: string, payload: TestDoneArgs): Promise<void> {
    return sendReportCommand(id, CommandTypes.reportTestDone, payload);
}

export async function sendTaskDoneCommand (id: string, payload: TaskDoneArgs): Promise<void> {
    return sendReportCommand(id, CommandTypes.reportTaskDone, payload);
}

import { AggregateCommandType, AggregateNames, Logger } from './types/internal/';
import { TaskStartArgs, TestStartArgs, TaskDoneArgs, TestDoneArgs } from './types/';
import Transport from './transport';
import { UploaderCore } from './uploader-core';
import { RunStateBuilder } from './run-state-builder';
import { RunStateUploader } from './run-state-uploader';

export function s3ReportCommandsFactory (reportId: string, transport: Transport, logger: Logger) {
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

    const uploader         = new UploaderCore(transport, logger);
    const runStateBuilder  = new RunStateBuilder(reportId);
    const runStateUploader = new RunStateUploader(uploader, runStateBuilder);

    return {
        async sendTaskStartCommand (payload: TaskStartArgs) {
            runStateBuilder.reportTaskStarted(payload);

            const runUploadId = await runStateUploader.start(reportId);

            return sendReportCommand(AggregateCommandType.reportTaskStart, { ...payload, uploadId: runUploadId });
        },
        async sendTestStartCommand (payload: TestStartArgs) {
            runStateBuilder.reportTestStarted(payload);
        },
        async sendTestDoneCommand (payload: TestDoneArgs) {
            runStateBuilder.reportTestDone(payload);
        },
        async sendTaskDoneCommand (payload: TaskDoneArgs) {
            runStateBuilder.reportTaskDone(payload);

            await runStateUploader.end();

            return sendReportCommand(AggregateCommandType.reportTaskDone, payload);
        },
        async sendReportWarningsCommand (/*payload: ReportWarningArgs*/) {
            // TODO
        }
    };
};

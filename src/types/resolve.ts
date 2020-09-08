import { AggregateNames, AggregateCommandType } from './dashboard';

export type ResolveCommand<TPayload = Record<string, any>> = {
    aggregateId: string;
    aggregateName: AggregateNames;
    type: AggregateCommandType;
    payload?: TPayload;
}

export type UploadInfo = {
    uploadUrl: string;
    uploadId: string;
}

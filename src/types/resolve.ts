import { AggregateNames, CommandTypes } from './dashboard';

export type ResolveCommand<TPayload = Record<string, any>> = {
    aggregateId: string;
    aggregateName: AggregateNames;
    type: CommandTypes;
    payload?: TPayload;
}

export type UploadInfo = {
    uploadUrl: string;
    uploadId: string;
}

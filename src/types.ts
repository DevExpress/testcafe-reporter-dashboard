import { CommandTypes, AggregateNames } from "./consts";

export type ResolveCommand<TPayload = Record<string, any>> = {
    aggregateId: string,
    aggregateName: AggregateNames,
    type: CommandTypes,
    payload?: TPayload
}

export type UploadInfo = {
    uploadUrl: string,
    uploadId:  string,
    error?:    any
}

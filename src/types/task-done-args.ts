import { DateFromISOString } from 'io-ts-types';


import * as t from 'io-ts';
import { BuildIdSchema } from './common';


export const TaskResultSchema = t.readonly(
    t.exact(
        t.type({
            failedCount:  t.number,
            passedCount:  t.number,
            skippedCount: t.number
        })
    )
);

export type TaskResult = t.TypeOf<typeof TaskResultSchema>;

export const TaskDoneArgsSchema = t.readonly(
    t.exact(
        t.type({
            endTime:  DateFromISOString,
            passed:   t.number,
            warnings: t.array(t.string),
            result:   TaskResultSchema,
            buildId:  BuildIdSchema
        })
    )
);


export type TaskDoneArgs = t.TypeOf<typeof TaskDoneArgsSchema>;

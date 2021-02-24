import { DateFromISOString } from 'io-ts-types';


import * as t from 'io-ts';
import { BuildIdSchema } from '../general';


export const TestResultSchema = t.readonly(
    t.exact(
        t.type({
            failedCount:  t.number,
            passedCount:  t.number,
            skippedCount: t.number
        })
    )
);

export type TestResult = t.TypeOf<typeof TestResultSchema>;

export const TaskDoneArgsSchema = t.readonly(
    t.exact(
        t.type({
            endTime:  DateFromISOString,
            passed:   t.number,
            warnings: t.array(t.string),
            result:   TestResultSchema,
            buildId:  BuildIdSchema
        })
    )
);


export type TaskDoneArgs = t.TypeOf<typeof TaskDoneArgsSchema>;

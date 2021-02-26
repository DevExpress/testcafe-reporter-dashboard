
import * as t from 'io-ts';
import { NameSchema } from './common';


export const TestDoneArgsSchema = t.readonly(
    t.exact(
        t.type({
            testId:     NameSchema,
            skipped:    t.boolean,
            errorCount: t.number,
            duration:   t.number,
            uploadId:   t.string
        })
    )
);

export type TestDoneArgs = t.TypeOf<typeof TestDoneArgsSchema>;


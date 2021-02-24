
import * as t from 'io-ts';
import { NameSchema } from '../general';


export const TestDoneSchema = t.readonly(
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

export type TestDoneArgs = t.TypeOf<typeof TestDoneSchema>;


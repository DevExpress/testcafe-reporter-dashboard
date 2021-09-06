
import * as t from 'io-ts';
import { ShortIdSchema } from './common';


export const TestDoneArgsSchema = t.readonly(
    t.exact(
        t.type({
            testId:     ShortIdSchema,
            skipped:    t.boolean,
            errorCount: t.number,
            duration:   t.number,
            unstable:   t.union([t.boolean, t.undefined]),
            uploadId:   t.union([t.string, t.undefined])
        })
    )
);

export type TestDoneArgs = t.TypeOf<typeof TestDoneArgsSchema>;


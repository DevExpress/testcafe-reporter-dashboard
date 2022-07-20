import * as t from 'io-ts';
import { ShortIdSchema } from './common';


export const TestStartArgsSchema = t.readonly(
    t.exact(
        t.type({
            testId:  ShortIdSchema,
            skipped: t.boolean
        })
    )
);


export type TestStartArgs = t.TypeOf<typeof TestStartArgsSchema>;

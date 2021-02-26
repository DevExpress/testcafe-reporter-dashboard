import * as t from 'io-ts';
import { NameSchema } from './common';


export const TestStartArgsSchema = t.readonly(
    t.exact(
        t.type({
            testId: NameSchema,
        })
    )
);


export type TestStartArgs = t.TypeOf<typeof TestStartArgsSchema>;

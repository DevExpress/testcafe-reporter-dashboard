import * as t from 'io-ts';
import { NameSchema } from '../general';

export const TestStartInfoSchema = t.readonly(
    t.type({
        testId:    NameSchema,
        testRunId: t.array(NameSchema)
    }),
);


export type TestStartInfo = t.TypeOf<typeof TestStartInfoSchema>;


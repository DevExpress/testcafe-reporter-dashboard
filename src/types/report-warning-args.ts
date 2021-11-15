
import * as t from 'io-ts';
import { ShortIdSchema } from './common';

export const ReportWarningsSchema = t.readonly(
    t.exact(
        t.type({
            testId: ShortIdSchema,
        })
    )
);

export type ReportWarningArgs = t.TypeOf<typeof ReportWarningsSchema>;

import * as t from 'io-ts';
import { DateFromISOString } from 'io-ts-types';
import { BuildIdSchema, NameSchema, ShortIdSchema } from './common';

export const ReportedTestItemSchema = t.readonly(
    t.exact(
        t.type({
            id:   ShortIdSchema,
            name: NameSchema,
            skip: t.boolean
        })
    )
);

export type ReportedTestItem = t.TypeOf<typeof ReportedTestItemSchema>


export const ReportedFixtureItemSchema = t.readonly(
    t.exact(
        t.type({
            id:    NameSchema,
            name:  NameSchema,
            tests: t.array(ReportedTestItemSchema)
        })
    )
);

export type ReportedFixtureItem = t.TypeOf<typeof ReportedFixtureItemSchema>


export const ReportedTestStructureItemSchema = t.readonly(
    t.exact(
        t.type({
            fixture: ReportedFixtureItemSchema
        })
    )
);

export type ReportedTestStructureItem = t.TypeOf<typeof ReportedTestStructureItemSchema>

export const ScreenshotOptionValueSchema = t.readonly(
    t.exact(
        t.type({
            path:            t.string,
            takeOnFails:     t.union([t.undefined, t.boolean]),
            pathPattern:     t.union([t.undefined, t.string]),
            fullPage:        t.union([t.undefined, t.boolean]),
            thumbnails:      t.union([t.undefined, t.boolean]),
            autoTakeOnFails: t.union([t.undefined, t.boolean])
        })
    )
);

export type ScreenshotOptionValue = t.TypeOf<typeof ScreenshotOptionValueSchema>;

export const QuarantineOptionValueSchema = t.readonly(
    t.exact(
        t.partial({
            attemptLimit:     t.number,
            successThreshold: t.number
        })
    )
);

export type QuarantineOptionValue = t.TypeOf<typeof QuarantineOptionValueSchema>;

export const TestingEntryHooksSchema = t.readonly(
    t.exact(
        t.partial({
            before: t.unknown,
            after:  t.unknown
        })
    )
);

export type TestingEntryHooks = t.TypeOf<typeof TestingEntryHooksSchema>;

export const GlobalHooksSchema = t.readonly(
    t.exact(
        t.partial({
            testRun: TestingEntryHooksSchema,
            fixture: TestingEntryHooksSchema,
            test:    TestingEntryHooksSchema,
            request: t.unknown
        })
    )
);

export type GlobalHooks = t.TypeOf<typeof GlobalHooksSchema>;

export const CompilerOptionsSchema = t.readonly(
    t.exact(
        t.type({
            typescript: t.unknown
        })
    )
);

export type CompilerOptions = t.TypeOf<typeof CompilerOptionsSchema>;

export const OptionValueSchema = t.union([
    t.undefined,
    t.null,
    t.string,
    t.boolean,
    t.number,
    t.array(t.string),
    t.Function,
    t.record(t.string, t.unknown),
    ScreenshotOptionValueSchema,
    QuarantineOptionValueSchema,
    CompilerOptionsSchema,
    GlobalHooksSchema
]);

export type OptionValue = t.TypeOf<typeof OptionValueSchema>;

export const TaskPropertiesSchema = t.readonly(
    t.exact(
        t.type({
            configuration: t.record(t.string, OptionValueSchema),
            dashboardUrl:  OptionValueSchema
        })
    )
);

export type TaskProperties = t.TypeOf<typeof TaskPropertiesSchema>;

export const CIInfoSchema = t.readonly(
    t.exact(
        t.partial({
            commitSHA:  t.string,
            author:     t.string,
            branchName: t.string
        })
    )
);

export type CIInfo = t.TypeOf<typeof CIInfoSchema>

export const TaskStartArgsSchema  = t.readonly(
    t.exact(
        t.type({
            startTime:     DateFromISOString,
            userAgents:    t.array(t.string),
            testCount:     t.number,
            buildId:       BuildIdSchema,
            taskStructure: t.array(ReportedTestStructureItemSchema),
            ciInfo:        t.union([t.undefined, CIInfoSchema])
        })
    )
);

export type TaskStartArgs = t.TypeOf<typeof TaskStartArgsSchema>;

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
    t.type({
        startTime:     DateFromISOString,
        userAgents:    t.array(t.string),
        testCount:     t.number,
        buildId:       BuildIdSchema,
        taskStructure: t.array(ReportedTestStructureItemSchema),
        ciInfo:        t.union([t.undefined, CIInfoSchema])
    })
);

export type TaskStartArgs = t.TypeOf<typeof TaskStartArgsSchema>;

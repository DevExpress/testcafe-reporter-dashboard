import * as t from 'io-ts';
import { DateFromISOString } from 'io-ts-types';
import { BuildIdSchema, NameSchema } from '../general';

export const ReportedTestItemSchema = t.readonly(
    t.exact(
        t.type({
            id:   NameSchema,
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


export const TaskStartArgsSchema  = t.readonly(
    t.type({
        startTime:     DateFromISOString,
        userAgents:    t.array(t.string),
        testCount:     t.number,
        buildId:       BuildIdSchema,
        taskStructure: t.array(ReportedTestStructureItemSchema)
    })
);

export type TaskStartArgs = t.TypeOf<typeof TaskStartArgsSchema>;

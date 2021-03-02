import { MAX_BUILD_ID_LENGTH } from '../consts';
import * as t from 'io-ts';

export interface MaxLengthString<N> {
    readonly MaxLengthString: unique symbol;
    readonly length: N;
  }

export const MaxLengthString = <N extends number>(len: N) =>
    t.brand(
      t.string,
      (s): s is t.Branded<string, MaxLengthString<N>> => s.length <= len,
      'MaxLengthString'
    );


export const AggregateId = MaxLengthString(190);

export const ShortIdSchema = MaxLengthString(10);

export type ShortId = t.TypeOf<typeof ShortIdSchema>;

export const NameSchema = MaxLengthString(300);

export type Name = t.TypeOf<typeof NameSchema>;

export const BuildIdSchema = t.union([MaxLengthString(MAX_BUILD_ID_LENGTH), t.undefined]);

export type BuildId = t.TypeOf<typeof BuildIdSchema>;

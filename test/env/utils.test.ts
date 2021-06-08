import assert from 'assert';
import { parseBooleanVariable, parseNumber } from '../../src/env/utils';

describe('Env utils', () => {
    describe('parseBooleanVariable()', () => {
        it('Should return false if value equals "false"', () => {
            assert.equal(parseBooleanVariable('false'), false);
        });

        it('Should return false if value equals "0"', () => {
            assert.equal(parseBooleanVariable('0'), false);
        });

        it('Should return false if value is undefined', () => {
            assert.equal(parseBooleanVariable(void 0), false);
        });

        it('Should return true if value is truthy ', () => {
            assert.equal(parseBooleanVariable('true'), true);
        });
    });

    describe('parseNumber()', () => {
        it('Should return null if value is not specified', () => {
            assert.equal(parseNumber(void 0), null);
        });

        it('Should return number if value is a string representatnion of number', () => {
            assert.equal(parseNumber('60000'), 60000);
        });
    });
});

import uuid from 'uuid';
import assert from 'assert';

import { CONCURRENT_ERROR_CODE, RETRY_ERROR_CODES } from '../src/consts';
import Transport from '../src/transport';
import { AggregateCommandType, AggregateNames } from '../src/types/internal/dashboard';
import logger from '../src/logger';

describe('sendResolveCommand', () => {
    it('Retry command test', async () => {
        let sendCommandCount = 0;

        const fetchMock = function retryCommandTest () {
            sendCommandCount++;

            const response = sendCommandCount === 1 ? { status: CONCURRENT_ERROR_CODE, ok: false } : { status: 200, ok: true };

            return Promise.resolve(response as Response);
        };

        const transport = new Transport(fetchMock, 'http://localhost', 'authentication_token', false, logger);

        await transport.sendResolveCommand({
            aggregateId:   uuid(),
            aggregateName: AggregateNames.Run,
            type:          AggregateCommandType.reportTestStart,
            payload:       { name: 'test 1' }
        });

        assert.equal(sendCommandCount, 2);
    });

    it('Retry fetch test', async () => {
        let sendCommandCount = 0;

        const fetchMock = function retryCommandTest () {
            if (++sendCommandCount < 9)
                throw { code: RETRY_ERROR_CODES[sendCommandCount % 2] };
            else
                return Promise.resolve({ status: 200, ok: true } as Response);
        };

        const transport = new Transport(fetchMock, 'http://localhost', 'authentication_token', false, logger);

        await transport.fetch('http://localhost', {});

        assert.equal(sendCommandCount, 9);
    });

    it('Should return fetch response with error', async () => {
        let sendCommandCount = 0;

        const fetchMock = function retryCommandTest () {
            if (++sendCommandCount <= 11) {
                throw {
                    code:     RETRY_ERROR_CODES[sendCommandCount % 2],
                    toString: function toString () {
                        return `code: ${this.code}`;
                    }
                };
            }
            else
                return Promise.resolve({ status: 200, ok: true } as Response);
        };

        const transport = new Transport(fetchMock, 'http://localhost', 'authentication_token', false, logger);

        const response = await transport.fetch('http://localhost', {});

        assert.equal(response.toString(), '0 - Connection failed. code: ETIMEDOUT');
    });
});

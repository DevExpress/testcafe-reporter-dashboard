import uuid from 'uuid';
import assert from 'assert';

import {
    CLIENTTIMEOUT_ERROR_MSG,
    CONCURRENT_ERROR_CODE,
    RETRY_ERRORS,
    SERVICE_UNAVAILABLE_ERROR_CODE
} from '../src/consts';

import Transport from '../src/transport';
import { AggregateCommandType, AggregateNames } from '../src/types/internal/dashboard';
import logger from '../src/logger';

describe('Transport', () => {
    it('Retry command', async () => {
        let sendCommandCount = 0;

        const fetchMock = function retryCommandTest () {
            sendCommandCount++;

            const response = sendCommandCount === 1 ? { status: CONCURRENT_ERROR_CODE, ok: false } : { status: 200, ok: true };

            return Promise.resolve(response as Response);
        };

        const transport = new Transport(fetchMock, 'http://localhost', 'authentication_token', false, logger, 1000, 10);

        await transport.sendResolveCommand({
            aggregateId:   uuid(),
            aggregateName: AggregateNames.Run,
            type:          AggregateCommandType.reportTestStart,
            payload:       { name: 'test 1' }
        });

        assert.equal(sendCommandCount, 2);
    });

    it('Retry fetch on network error', async () => {
        let sendCommandCount = 0;

        const fetchMock = function retryCommandTest () {
            if (++sendCommandCount < 9)
                throw { code: RETRY_ERRORS[sendCommandCount % 2] };
            else
                return Promise.resolve({ status: 200, ok: true } as Response);
        };

        const transport = new Transport(fetchMock, 'http://localhost', 'authentication_token', false, logger, 1000, 10);

        await transport.fetch('http://localhost', {});

        assert.equal(sendCommandCount, 9);
    });

    it('Retry fetch on server error', async () => {
        let sendCommandCount = 0;

        const fetchMock = function retryCommandTest () {
            sendCommandCount++;

            const response = sendCommandCount === 1 ? { status: SERVICE_UNAVAILABLE_ERROR_CODE, ok: false } : { status: 200, ok: true };

            return Promise.resolve(response as Response);
        };

        const transport = new Transport(fetchMock, 'http://localhost', 'authentication_token', false, logger, 1000, 10);

        await transport.fetch('http://localhost', {});

        assert.equal(sendCommandCount, 2);
    });

    it('Should return fetch response with error', async () => {
        let sendCommandCount = 0;

        const fetchMock = function retryCommandTest () {
            if (++sendCommandCount <= 11) {
                throw {
                    code:     RETRY_ERRORS[sendCommandCount % 3],
                    toString: function toString () {
                        return `code: ${this.code}`;
                    }
                };
            }
            else
                return Promise.resolve({ status: 200, ok: true } as Response);
        };

        const transport = new Transport(fetchMock, 'http://localhost', 'authentication_token', false, logger, 1000, 10);

        const response = await transport.fetch('http://localhost', {});

        assert.equal(response.toString(), '0 - Connection failed. code: ECONNREFUSED');
    });

    it('Retry uses a shared retry counter for server and client errors', async () => {
        let sendCommandCount = 0;

        const fetchMock = function retryCommandTest () {
            sendCommandCount++;

            if (sendCommandCount === 1) {
                throw {
                    code:     RETRY_ERRORS[0],
                    toString: function toString () {
                        return `code: ${this.code}`;
                    }
                };
            }

            if (sendCommandCount === 2)
                return Promise.resolve({ status: SERVICE_UNAVAILABLE_ERROR_CODE, ok: false } as Response);

            if (sendCommandCount === 3) {
                throw {
                    code:     RETRY_ERRORS[1],
                    toString: function toString () {
                        return `code: ${this.code}`;
                    }
                };
            }

            return Promise.resolve({ status: 200, ok: true } as Response);
        };

        const transport = new Transport(fetchMock, 'http://localhost', 'authentication_token', false, logger, 1000, 2);

        const response = await transport.fetch('http://localhost', {});

        assert.equal(response.toString(), `0 - Connection failed. code: ${RETRY_ERRORS[1]}`);
    });

    describe('Should throw client timeout error if fetch hangs', () => {
        let timeout: NodeJS.Timeout | null = null;

        let fetchReject = () => {}; //eslint-disable-line @typescript-eslint/no-empty-function
        const fetchMock = function retryCommandTest () {
            return new Promise<Response>((resolve, reject) => {
                timeout = setTimeout(() => {
                    resolve({ ok: true, status: 200 } as Response);
                }, 2500);

                fetchReject = reject;
            });
        };

        afterEach(() => {
            fetchReject();

            if (timeout) clearTimeout(timeout);
        });

        it('Fetch from dashboard', async () => {
            const transport = new Transport(fetchMock, 'http://localhost', 'authentication_token', false, logger, 100, 5);
            const response  = await transport.fetchFromDashboard('api/uploader');

            assert.equal(response.toString(), `0 - Connection failed. Error: ${CLIENTTIMEOUT_ERROR_MSG}`);
        });

        it('Send resolve command', async () => {
            const errors      = [] as string[];
            const logMessages = [] as string[];
            const loggerMock = {
                ...logger,
                error: (message: string) => errors.push(message),
                log:   (message: string) => logMessages.push(message)
            };
            const transport  = new Transport(fetchMock, 'http://localhost', 'authentication_token', true, loggerMock, 100, 5);

            await transport.sendResolveCommand({
                aggregateId:   'report_1',
                aggregateName: AggregateNames.Run,
                type:          AggregateCommandType.reportTestStart,
                payload:       { testId: 'test_1' }
            });

            assert.equal(errors.length, 1);
            assert.equal(errors[0], `report_1 reportTestStart 0 - Connection failed. Error: ${CLIENTTIMEOUT_ERROR_MSG}`);
            assert.equal(logMessages.length, 6);
        });
    });
});

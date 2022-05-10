import assert from 'assert';

import { decodeBase64AuthenticationToken } from '../../src/validate-settings';
import { AUTHENTICATION_TOKEN_INVALID } from '../../src/texts';

const validTokenString   = 'eyJwcm9qZWN0SWQiOiJhZWUzMDc3ZC1hNjJiLTQ2Y2YtYWZhYS04MDYzYzE5NmQ2YzIiLCJ0b2tlblNlY3JldCI6InJTcFJpQmxuRzhnNDg1UmNod3BQMXVUVVUrRUtldGxqdGN5enp3ZjBVT3ROQTQzVjhCWUZ2Qk1Gc05Hajh1T2N2STRvckRGYlFUUFpLUU9PbDM0aWNacnI0RzhzbXZhRjZ3cW80M09TTjEwS3NpbTFGTEdpVzI5VW93ajAwOGZpUGthRFZaZW1aVzlFaDhobTZVc1VLbjhPOEZrZkpqZlN4VkJ6S1lhTUNKWlI4L3c2bXdEWlJCa2R5OVROSUUzVjRGaFBvV3dYVTNaczlKR2RxNGNzTUxEM2dhbURlRytITnpsQ0hEekI1VWZ4UEdORUx6SHpGWXNrYkNQa2ZBM1cxbEJFbzliUzdERUFtSWJrOVhIdWp2OEJXaTQ4MlBZM1RzYzFncjkyU0w4TjF5d3VQNkZuSmErNklRTDZwakRTT044VGlvaXJscUEzdGtKZStNM1hkdz09In0=';
const expectedValidToken = {
    projectId:   'aee3077d-a62b-46cf-afaa-8063c196d6c2',
    tokenSecret: 'rSpRiBlnG8g485RchwpP1uTUU+EKetljtcyzzwf0UOtNA43V8BYFvBMFsNGj8uOcvI4orDFbQTPZKQOOl34icZrr4G8smvaF6wqo43OSN10Ksim1FLGiW29Uowj008fiPkaDVZemZW9Eh8hm6UsUKn8O8FkfJjfSxVBzKYaMCJZR8/w6mwDZRBkdy9TNIE3V4FhPoWwXU3Zs9JGdq4csMLD3gamDeG+HNzlCHDzB5UfxPGNELzHzFYskbCPkfA3W1lBEo9bS7DEAmIbk9XHujv8BWi482PY3Tsc1gr92SL8N1ywuP6FnJa+6IQL6pjDSON8TioirlqA3tkJe+M3Xdw=='
};

describe('Validate settings', () => {
    describe('decodeBase64AuthenticationToken', () => {
        it('should return valid decoded token', () => {
            const token = decodeBase64AuthenticationToken(validTokenString);

            assert.deepStrictEqual(token, expectedValidToken);
        });

        it('should throw AUTHENTICATION_TOKEN_INVALID for invalid token', () => {
            assert.throws(() => decodeBase64AuthenticationToken('invalid-token'), new Error(AUTHENTICATION_TOKEN_INVALID));
        });
    });
});

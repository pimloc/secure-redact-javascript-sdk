import { test, describe } from 'node:test';
import * as assert from 'node:assert';
import { buildBasicToken } from '../utils/buildBasicToken';

const clientId = 'clientId';
const clientSecret = 'clientSecret';
const expectedToken = 'Basic Y2xpZW50SWQ6Y2xpZW50U2VjcmV0';

describe('test buildBasicToken functionality', () => {
  test('fails if no clientId provided', () => {
    assert.throws(() => buildBasicToken('', clientSecret), {
      name: 'SecureRedactError',
      message: 'clientId and clientSecret must be defined'
    });
  });
  test('fails if no clientSecret provided', () => {
    assert.throws(() => buildBasicToken(clientId, ''), {
      name: 'SecureRedactError',
      message: 'clientId and clientSecret must be defined'
    });
  });
  test('fails if no params provided', () => {
    assert.throws(() => buildBasicToken('', ''), {
      name: 'SecureRedactError',
      message: 'clientId and clientSecret must be defined'
    });
  });
  test('returns base64 encoded string', () => {
    const token = buildBasicToken(clientId, clientSecret);
    assert.equal(typeof token, 'string');
    assert.equal(token, expectedToken);
  });
});

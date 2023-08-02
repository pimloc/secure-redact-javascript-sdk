import { test, describe, mock, before, afterEach, after } from 'node:test';
import * as assert from 'node:assert';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { SecureRedactSDK } from '../SecureRedactSDK';
import { creds } from './utils';

const dummyUsername = 'test@test.com';
const validData: { error: string | null; token: string } = {
  error: null,
  token: creds.bearerToken
};
const mockCallback = mock.fn();

const server = setupServer(
  rest.get('https://app.secureredact.co.uk/api/v2/token', (req, res, ctx) => {
    const username = req.url.searchParams.get('username');
    if (username) {
      mockCallback(username);
    }
    if (req.headers.get('authorization') === creds.basicToken) {
      return res(ctx.status(200), ctx.json(validData));
    } else {
      return res(ctx.status(403), ctx.json({ error: 'Forbidden' }));
    }
  })
);

describe('test fetchToken functionality', () => {
  before(() => server.listen());
  afterEach(() => server.resetHandlers());
  after(() => server.close());

  test('fetch token fails if invalid clientId', async () => {
    const secureRedact = new SecureRedactSDK({
      clientId: 'bad clientId',
      clientSecret: creds.clientSecret
    });
    await assert.rejects(async () => await secureRedact.fetchToken(), {
      name: 'SecureRedactError',
      message: 'Received invalid response: Forbidden',
      statusCode: 403
    });
  });

  test('fetch token fails if invalid clientSecret', async () => {
    const secureRedact = new SecureRedactSDK({
      clientId: creds.clientId,
      clientSecret: 'bad client secret'
    });
    await assert.rejects(async () => await secureRedact.fetchToken(), {
      name: 'SecureRedactError',
      message: 'Received invalid response: Forbidden',
      statusCode: 403
    });
  });

  test('fetch token suceeds with valid credentials', async () => {
    const secureRedact = new SecureRedactSDK({
      clientId: creds.clientId,
      clientSecret: creds.clientSecret
    });
    const token = await secureRedact.fetchToken();
    assert.strictEqual(token, `Bearer ${validData.token}`);
  });

  test('fetch token suceeds with valid credentials and username', async () => {
    const secureRedact = new SecureRedactSDK({
      clientId: creds.clientId,
      clientSecret: creds.clientSecret
    });
    const token = await secureRedact.fetchToken({ username: dummyUsername });
    assert.strictEqual(token, `Bearer ${validData.token}`);
    assert.strictEqual(mockCallback.mock.calls.length, 1);
    assert.strictEqual(mockCallback.mock.calls[0].arguments[0], dummyUsername);
  });
});

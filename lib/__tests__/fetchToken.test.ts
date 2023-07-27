import { test, describe, mock, before, afterEach, after } from 'node:test';
import * as assert from 'node:assert';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { SecureRedactSDK } from '../SecureRedactSDK.ts';

const clientId = 'clientId';
const clientSecret = 'clientSecret';
const expectedToken = 'Basic Y2xpZW50SWQ6Y2xpZW50U2VjcmV0';
const dummyUsername = 'test@test.com';
const validData: { error: string | null; token: string } = {
  error: null,
  token: 'dummy.jwt.token'
};
const mockCallback = mock.fn();

const server = setupServer(
  rest.get('https://app.secureredact.co.uk/api/v2/token', (req, res, ctx) => {
    const username = req.url.searchParams.get('username');
    if (username) {
      mockCallback(username);
    }
    if (req.headers.get('authorization') === expectedToken) {
      return res(ctx.status(200), ctx.json(validData));
    } else {
      return res(ctx.status(403), ctx.json({ error: 'Forbidden' }));
    }
  })
);

describe.only('test fetchToken functionality', () => {
  before(() => server.listen());
  afterEach(() => server.resetHandlers());
  after(() => server.close());

  test.only('fetch token fails if invalid clientId', async () => {
    const secureRedact = new SecureRedactSDK({
      clientId: 'bad clientId',
      clientSecret
    });
    await assert.rejects(async () => await secureRedact.fetchToken(), {
      name: 'SecureRedactError',
      message: 'Received invalid response: Forbidden',
      statusCode: 403
    });
  });

  test.only('fetch token fails if invalid clientSecret', async () => {
    const secureRedact = new SecureRedactSDK({
      clientId,
      clientSecret: 'bad client secret'
    });
    await assert.rejects(async () => await secureRedact.fetchToken(), {
      name: 'SecureRedactError',
      message: 'Received invalid response: Forbidden',
      statusCode: 403
    });
  });

  test.only('fetch token suceeds with valid credentials', async () => {
    const secureRedact = new SecureRedactSDK({
      clientId,
      clientSecret
    });
    const token = await secureRedact.fetchToken();
    assert.strictEqual(token, validData.token);
  });

  test.only('fetch token suceeds with valid credentials and username', async () => {
    const secureRedact = new SecureRedactSDK({
      clientId,
      clientSecret
    });
    const token = await secureRedact.fetchToken(dummyUsername);
    assert.strictEqual(token, validData.token);
    assert.strictEqual(mockCallback.mock.calls.length, 1);
    assert.strictEqual(mockCallback.mock.calls[0].arguments[0], dummyUsername);
  });
});

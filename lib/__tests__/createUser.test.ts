import {
  test,
  describe,
  before,
  beforeEach,
  afterEach,
  after
} from 'node:test';
import * as assert from 'node:assert';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { SecureRedactSDK } from '../SecureRedactSDK.ts';
import {
  authenticatedTokenTests,
  creds,
  defaultHandlers,
  invalidAuthenticatedTokenTest,
  tokenEndpointHitCallback
} from './utils.ts';

const validResponse = {
  username: 'test@test.com',
  error: null as string | null,
  msg: undefined
};

const server = setupServer(
  ...defaultHandlers,
  rest.post('https://app.secureredact.co.uk/api/v2/signup', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(validResponse));
  })
);

describe('test createUser functionality', () => {
  before(() => server.listen());
  beforeEach(() => tokenEndpointHitCallback.mock.resetCalls());
  afterEach(() => server.resetHandlers());
  after(() => server.close());

  const invalidSecureRedact = new SecureRedactSDK({
    clientId: 'invalid',
    clientSecret: 'invalid'
  });

  invalidAuthenticatedTokenTest(invalidSecureRedact.createUser, {
    mediaId: validResponse.username
  });

  const secureRedact = new SecureRedactSDK({
    clientId: creds.clientId,
    clientSecret: creds.clientSecret
  });
  authenticatedTokenTests(secureRedact.fetchToken, secureRedact.createUser, {
    mediaId: validResponse.username
  });

  test('fails if create route throws', async () => {
    const badError = 'bad error';
    server.use(
      rest.post(
        'https://app.secureredact.co.uk/api/v2/signup',
        (req, res, ctx) => {
          return res(ctx.status(500), ctx.json({ error: badError }));
        }
      )
    );
    await assert.rejects(
      async () =>
        await secureRedact.createUser({
          username: validResponse.username
        }),
      {
        name: 'SecureRedactError',
        statusCode: 500,
        message: `Received invalid response: ${badError}`
      }
    );
  });

  test('suceeds if new user', async () => {
    const result = await secureRedact.createUser({
      username: validResponse.username
    });
    assert.deepStrictEqual(result, {
      username: validResponse.username,
      error: validResponse.error,
      msg: validResponse.msg
    });
  });

  test('suceeds if user already exists', async () => {
    server.use(
      rest.post(
        'https://app.secureredact.co.uk/api/v2/signup',
        (req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({ ...validResponse, msg: 'user already exists' })
          );
        }
      )
    );
    const result = await secureRedact.createUser({
      username: validResponse.username
    });
    assert.deepStrictEqual(result, {
      username: validResponse.username,
      error: validResponse.error,
      msg: 'user already exists'
    });
  });
});

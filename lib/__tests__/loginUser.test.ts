import {
  test,
  mock,
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
  authenticatedTokenUsernameProvidedTest,
  creds,
  defaultHandlers,
  invalidAuthenticatedTokenTest,
  tokenEndpointHitCallback
} from './utils.ts';
import { LoginUserParams } from '../types.ts';

const requestParams: LoginUserParams = {
  mediaId: 'random',
  username: 'test@test.com'
};
const validResponse = {
  success: true,
  redirectUrl: 'https://app.secureredact.co.uk?media_id=random'
};

const server = setupServer(
  ...defaultHandlers,
  rest.post('https://app.secureredact.co.uk/api/v2/login', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ ...validResponse, redirect_url: validResponse.redirectUrl })
    );
  })
);

describe('test deleteMedia functionality', () => {
  before(() => server.listen());
  beforeEach(() => tokenEndpointHitCallback.mock.resetCalls());
  afterEach(() => server.resetHandlers());
  after(() => server.close());

  const invalidSecureRedact = new SecureRedactSDK({
    clientId: 'invalid',
    clientSecret: 'invalid'
  });

  invalidAuthenticatedTokenTest(invalidSecureRedact.loginUser, {
    mediaId: requestParams.mediaId
  });

  const secureRedact = new SecureRedactSDK({
    clientId: creds.clientId,
    clientSecret: creds.clientSecret
  });
  test('calls token endpoint if no token', async () => {
    await secureRedact.loginUser({
      mediaId: requestParams.mediaId,
      username: requestParams.username
    });
    assert.strictEqual(tokenEndpointHitCallback.mock.calls.length, 1);
  });

  authenticatedTokenUsernameProvidedTest(
    secureRedact.fetchToken,
    secureRedact.loginUser,
    {
      mediaId: requestParams.mediaId,
      username: requestParams.username
    }
  );

  test('fails if login user route throws', async () => {
    const badError = 'bad error';
    server.use(
      rest.post(
        'https://app.secureredact.co.uk/api/v2/login',
        (req, res, ctx) => {
          return res(ctx.status(500), ctx.json({ error: badError }));
        }
      )
    );
    await assert.rejects(
      async () =>
        await secureRedact.loginUser({
          mediaId: requestParams.mediaId,
          username: requestParams.username
        }),
      {
        name: 'SecureRedactError',
        statusCode: 500,
        message: `Received invalid response: ${badError}`
      }
    );
  });

  test('login user succeeds', async () => {
    const result = await secureRedact.loginUser({
      mediaId: requestParams.mediaId,
      username: requestParams.username
    });
    assert.deepStrictEqual(result, validResponse);
  });

  test('login user suceeds and sends correct params', async () => {
    const mockCallback = mock.fn();
    server.use(
      rest.post(
        'https://app.secureredact.co.uk/api/v2/login',
        async (req, res, ctx) => {
          const body = await req.json();
          mockCallback(body);
          return res(
            ctx.status(200),
            ctx.json({
              ...validResponse,
              redirect_url: validResponse.redirectUrl
            })
          );
        }
      )
    );
    const result = await secureRedact.loginUser(requestParams);
    assert.deepStrictEqual(result, validResponse);
    assert.strictEqual(mockCallback.mock.calls.length, 1);
    assert.deepStrictEqual(mockCallback.mock.calls[0].arguments[0], {
      media_id: requestParams.mediaId
    });
  });
});

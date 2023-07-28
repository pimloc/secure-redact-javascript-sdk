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
  authenticatedTokenUsernameProvidedTest,
  tokenEndpointHitCallback
} from './utils.ts';

const validResponse = {
  media_id: 'random',
  username: 'test@test.com',
  error: null as string | null,
  status: 'detected'
};

const server = setupServer(
  ...defaultHandlers,
  rest.get('https://app.secureredact.co.uk/api/v2/info', (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(validResponse));
  })
);

describe('test fetchMediaStatus functionality', () => {
  before(() => server.listen());
  beforeEach(() => tokenEndpointHitCallback.mock.resetCalls());
  afterEach(() => server.resetHandlers());
  after(() => server.close());

  const invalidSecureRedact = new SecureRedactSDK({
    clientId: 'invalid',
    clientSecret: 'invalid'
  });

  invalidAuthenticatedTokenTest(invalidSecureRedact.fetchMediaStatus, {
    mediaId: validResponse.media_id
  });

  const secureRedact = new SecureRedactSDK({
    clientId: creds.clientId,
    clientSecret: creds.clientSecret
  });
  authenticatedTokenTests(
    secureRedact.fetchToken,
    secureRedact.fetchMediaStatus,
    {
      mediaId: validResponse.media_id
    }
  );
  authenticatedTokenUsernameProvidedTest(
    secureRedact.fetchToken,
    secureRedact.fetchMediaStatus,
    {
      mediaId: validResponse.media_id
    }
  );

  test('fails if info route throws', async () => {
    const badError = 'bad error';
    server.use(
      rest.get(
        'https://app.secureredact.co.uk/api/v2/info',
        (req, res, ctx) => {
          return res(ctx.status(500), ctx.json({ error: badError }));
        }
      )
    );
    await assert.rejects(
      async () =>
        await secureRedact.fetchMediaStatus({
          mediaId: validResponse.media_id
        }),
      {
        name: 'SecureRedactError',
        statusCode: 500,
        message: `Received invalid response: ${badError}`
      }
    );
  });

  test('returns correct data', async () => {
    const result = await secureRedact.fetchMediaStatus({
      mediaId: validResponse.media_id,
      username: validResponse.username
    });
    assert.deepStrictEqual(result, {
      mediaId: validResponse.media_id,
      username: validResponse.username,
      error: validResponse.error,
      status: validResponse.status
    });
  });
});

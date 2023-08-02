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
  authenticatedTokenTests,
  creds,
  defaultHandlers,
  invalidAuthenticatedTokenTest,
  authenticatedTokenUsernameProvidedTest,
  tokenEndpointHitCallback
} from './utils.ts';
import { SecureRedactRedactMediaParams } from '../types/lib.ts';

const requestParams: SecureRedactRedactMediaParams = {
  mediaId: 'random',
  enlargeBoxes: 0.5,
  redactAudio: true,
  blur: 'pixelated'
};
const validResponse = {
  error: null
};

const server = setupServer(
  ...defaultHandlers,
  rest.post('https://app.secureredact.co.uk/api/v2/redact', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        error: validResponse.error
      })
    );
  })
);

describe('test redactMedia functionality', () => {
  before(() => server.listen());
  beforeEach(() => tokenEndpointHitCallback.mock.resetCalls());
  afterEach(() => server.resetHandlers());
  after(() => server.close());

  const invalidSecureRedact = new SecureRedactSDK({
    clientId: 'invalid',
    clientSecret: 'invalid'
  });

  invalidAuthenticatedTokenTest(invalidSecureRedact.redactMedia, {
    mediaId: requestParams.mediaId
  });

  const secureRedact = new SecureRedactSDK({
    clientId: creds.clientId,
    clientSecret: creds.clientSecret
  });
  authenticatedTokenTests(secureRedact.fetchToken, secureRedact.redactMedia, {
    mediaId: requestParams.mediaId
  });
  authenticatedTokenUsernameProvidedTest(
    secureRedact.fetchToken,
    secureRedact.redactMedia,
    {
      mediaId: requestParams.mediaId
    }
  );

  test('fails if redact route throws', async () => {
    const badError = 'bad error';
    server.use(
      rest.post(
        'https://app.secureredact.co.uk/api/v2/redact',
        (req, res, ctx) => {
          return res(ctx.status(500), ctx.json({ error: badError }));
        }
      )
    );
    await assert.rejects(
      async () =>
        await secureRedact.redactMedia({
          mediaId: requestParams.mediaId
        }),
      {
        name: 'SecureRedactError',
        statusCode: 500,
        message: `Received invalid response: ${badError}`
      }
    );
  });

  test('redact succeeds', async () => {
    const result = await secureRedact.redactMedia({
      mediaId: requestParams.mediaId
    });
    assert.deepStrictEqual(result, validResponse);
  });

  test('redact suceeds and sends correct params', async () => {
    const mockCallback = mock.fn();
    server.use(
      rest.post(
        'https://app.secureredact.co.uk/api/v2/redact',
        async (req, res, ctx) => {
          const body = await req.json();
          mockCallback(body);
          return res(ctx.status(200), ctx.json({ error: null }));
        }
      )
    );
    const result = await secureRedact.redactMedia(requestParams);
    assert.deepStrictEqual(result, validResponse);
    assert.strictEqual(mockCallback.mock.calls.length, 1);
    assert.deepStrictEqual(mockCallback.mock.calls[0].arguments[0], {
      media_id: requestParams.mediaId,
      enlarge_boxes: requestParams.enlargeBoxes,
      redact_audio: requestParams.redactAudio,
      blur: requestParams.blur
    });
  });
});

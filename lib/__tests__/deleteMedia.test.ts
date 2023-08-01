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
  tokenEndpointHitCallback
} from './utils.ts';
import { DeleteMediaParams } from '../types.ts';

const requestParams: DeleteMediaParams = {
  mediaId: 'random'
};
const validResponse = {
  error: null,
  message: 'delete complete',
  mediaId: 'random'
};

const server = setupServer(
  ...defaultHandlers,
  rest.post(
    'https://app.secureredact.co.uk/api/v2/video/delete',
    (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({ ...validResponse, media_id: validResponse.mediaId })
      );
    }
  )
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

  invalidAuthenticatedTokenTest(invalidSecureRedact.deleteMedia, {
    mediaId: requestParams.mediaId
  });

  const secureRedact = new SecureRedactSDK({
    clientId: creds.clientId,
    clientSecret: creds.clientSecret
  });
  authenticatedTokenTests(secureRedact.fetchToken, secureRedact.deleteMedia, {
    mediaId: requestParams.mediaId
  });

  test('fails if delete route throws', async () => {
    const badError = 'bad error';
    server.use(
      rest.post(
        'https://app.secureredact.co.uk/api/v2/video/delete',
        (req, res, ctx) => {
          return res(ctx.status(500), ctx.json({ error: badError }));
        }
      )
    );
    await assert.rejects(
      async () =>
        await secureRedact.deleteMedia({
          mediaId: requestParams.mediaId
        }),
      {
        name: 'SecureRedactError',
        statusCode: 500,
        message: `Received invalid response: ${badError}`
      }
    );
  });

  test('delete succeeds', async () => {
    const result = await secureRedact.deleteMedia({
      mediaId: requestParams.mediaId
    });
    assert.deepStrictEqual(result, validResponse);
  });

  test('delete suceeds and sends correct params', async () => {
    const mockCallback = mock.fn();
    server.use(
      rest.post(
        'https://app.secureredact.co.uk/api/v2/video/delete',
        async (req, res, ctx) => {
          const body = await req.json();
          mockCallback(body);
          return res(
            ctx.status(200),
            ctx.json({ ...validResponse, media_id: validResponse.mediaId })
          );
        }
      )
    );
    const result = await secureRedact.deleteMedia(requestParams);
    assert.deepStrictEqual(result, validResponse);
    assert.strictEqual(mockCallback.mock.calls.length, 1);
    assert.deepStrictEqual(mockCallback.mock.calls[0].arguments[0], {
      media_id: requestParams.mediaId
    });
  });
});

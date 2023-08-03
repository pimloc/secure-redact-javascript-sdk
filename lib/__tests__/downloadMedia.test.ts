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
import { SecureRedactSDK } from '../SecureRedactSDK';
import {
  authenticatedTokenTests,
  creds,
  defaultHandlers,
  invalidAuthenticatedTokenTest,
  authenticatedTokenUsernameProvidedTest,
  tokenEndpointHitCallback
} from './utils';
import { SecureRedactDownloadMediaParams } from '../types/lib';

const requestParams: SecureRedactDownloadMediaParams = {
  mediaId: 'random'
};

// const dummyArrayBuffer = new ArrayBuffer(10);
const dummyBlob = new Blob(['hello world'], { type: 'text/plain' });
const server = setupServer(
  ...defaultHandlers,
  rest.get(
    'https://app.secureredact.co.uk/api/v2/download',
    (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.set('Content-Length', dummyBlob.size.toString()),
        ctx.body(dummyBlob)
      );
    }
  )
);

describe('test downloadMedia functionality', () => {
  before(() => server.listen());
  beforeEach(() => tokenEndpointHitCallback.mock.resetCalls());
  afterEach(() => server.resetHandlers());
  after(() => server.close());

  const invalidSecureRedact = new SecureRedactSDK({
    clientId: 'invalid',
    clientSecret: 'invalid'
  });

  invalidAuthenticatedTokenTest(invalidSecureRedact.downloadMedia, {
    mediaId: requestParams.mediaId
  });

  const secureRedact = new SecureRedactSDK({
    clientId: creds.clientId,
    clientSecret: creds.clientSecret
  });
  authenticatedTokenTests(secureRedact.fetchToken, secureRedact.downloadMedia, {
    mediaId: requestParams.mediaId
  });
  authenticatedTokenUsernameProvidedTest(
    secureRedact.fetchToken,
    secureRedact.downloadMedia,
    {
      mediaId: requestParams.mediaId
    }
  );

  test('fails if download route throws', async () => {
    server.use(
      rest.get(
        'https://app.secureredact.co.uk/api/v2/download',
        (req, res, ctx) => {
          const dummyArrayBuffer = new ArrayBuffer(10);
          return res(
            ctx.status(500),
            ctx.set('Content-Length', dummyArrayBuffer.byteLength.toString()),
            ctx.body(dummyArrayBuffer)
          );
        }
      )
    );
    await assert.rejects(
      async () =>
        await secureRedact.downloadMedia({
          mediaId: requestParams.mediaId
        }),
      {
        name: 'SecureRedactError',
        statusCode: 500,
        message: 'Received invalid response: Internal Server Error'
      }
    );
  });

  test('download suceeds', async () => {
    const { blob } = await secureRedact.downloadMedia({
      mediaId: requestParams.mediaId
    });
    assert.deepStrictEqual(blob, dummyBlob);
  });

  test('calls endpoint with correct parameters', async () => {
    server.use(
      rest.get(
        'https://app.secureredact.co.uk/api/v2/download',
        (req, res, ctx) => {
          const mediaId = req.url.searchParams.get('media_id');
          if (mediaId) {
            assert.strictEqual(mediaId, requestParams.mediaId);
          } else {
            assert.fail('media_id not found in request');
          }
          return res(
            ctx.status(200),
            ctx.set('Content-Length', dummyBlob.size.toString()),
            ctx.body(dummyBlob)
          );
        }
      )
    );
    await secureRedact.downloadMedia({
      mediaId: requestParams.mediaId
    });
  });
});

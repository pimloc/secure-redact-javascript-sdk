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
import { UploadMediaParams } from '../types.ts';

const videoTag = 'video_name';
const requestParams: UploadMediaParams = {
  mediaPath: 's3://bucket/key.mp4?access_token=randomstring',
  videoTag,
  increasedDetectionAccuracy: true,
  stateCallback: 'http://example.com/state',
  exportCallback: 'http://example.com/export',
  exportToken: 'random_token'
};
const validResponse = {
  fileInfo: {
    name: videoTag,
    mimetype: 'video/mp4',
    size: 100
  },
  mediaId: 'random',
  message: 'video download started',
  error: null
};

const server = setupServer(
  ...defaultHandlers,
  rest.post('https://app.secureredact.co.uk/api/v2/video', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        file_info: {
          name: validResponse.fileInfo.name,
          mimetype: validResponse.fileInfo.mimetype,
          size: validResponse.fileInfo.size
        },
        media_id: validResponse.mediaId,
        message: validResponse.message,
        error: validResponse.error
      })
    );
  })
);

describe('test uploadMedia functionality', () => {
  before(() => server.listen());
  beforeEach(() => tokenEndpointHitCallback.mock.resetCalls());
  afterEach(() => server.resetHandlers());
  after(() => server.close());

  const invalidSecureRedact = new SecureRedactSDK({
    clientId: 'invalid',
    clientSecret: 'invalid'
  });

  invalidAuthenticatedTokenTest(invalidSecureRedact.uploadMedia, {
    mediaPath: requestParams.mediaPath
  });

  const secureRedact = new SecureRedactSDK({
    clientId: creds.clientId,
    clientSecret: creds.clientSecret
  });
  authenticatedTokenTests(secureRedact.fetchToken, secureRedact.uploadMedia, {
    mediaPath: requestParams.mediaPath
  });

  test('fails if upload route throws', async () => {
    const badError = 'bad error';
    server.use(
      rest.post(
        'https://app.secureredact.co.uk/api/v2/video',
        (req, res, ctx) => {
          return res(ctx.status(500), ctx.json({ error: badError }));
        }
      )
    );
    await assert.rejects(
      async () =>
        await secureRedact.uploadMedia({
          mediaPath: requestParams.mediaPath
        }),
      {
        name: 'SecureRedactError',
        statusCode: 500,
        message: `Received invalid response: ${badError}`
      }
    );
  });

  test('upload succeeds', async () => {
    const result = await secureRedact.uploadMedia({
      mediaPath: requestParams.mediaPath
    });
    assert.deepStrictEqual(result, validResponse);
  });

  test('upload suceeds with', async () => {
    const mockCallback = mock.fn();
    server.use(
      rest.post(
        'https://app.secureredact.co.uk/api/v2/video',
        async (req, res, ctx) => {
          const body = await req.json();
          mockCallback(body);
          return res(
            ctx.status(200),
            ctx.json({
              ...validResponse,
              media_id: validResponse.mediaId,
              file_info: {
                ...validResponse.fileInfo,
                name: body.video_tag
              }
            })
          );
        }
      )
    );
    const result = await secureRedact.uploadMedia(requestParams);
    assert.deepStrictEqual(result, validResponse);
  });
});

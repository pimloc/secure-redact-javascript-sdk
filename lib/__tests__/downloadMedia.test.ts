import {
  test,
  describe,
  mock,
  before,
  beforeEach,
  afterEach,
  after
} from 'node:test';
import fs from 'node:fs';
import fsPromises from 'node:fs/promises';
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
  mediaId: 'random',
  outputPath: '/folder/file.mp4'
};

const dummyArrayBuffer = new ArrayBuffer(10);
const server = setupServer(
  ...defaultHandlers,
  rest.get(
    'https://app.secureredact.co.uk/api/v2/download',
    (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.set('Content-Length', dummyArrayBuffer.byteLength.toString()),
        ctx.body(dummyArrayBuffer)
      );
    }
  )
);

mock.method(fs, 'createWriteStream', () => {
  return {
    write: () => {},
    on: (event: string, handler: () => void) => {
      if (event === 'finish') {
        handler();
      }
      return null;
    }
  };
});

mock.method(fsPromises, 'access', async () => {
  return null;
});

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
    mediaId: requestParams.mediaId,
    outputPath: requestParams.outputPath
  });

  const secureRedact = new SecureRedactSDK({
    clientId: creds.clientId,
    clientSecret: creds.clientSecret
  });
  authenticatedTokenTests(secureRedact.fetchToken, secureRedact.downloadMedia, {
    mediaId: requestParams.mediaId,
    outputPath: requestParams.outputPath
  });
  authenticatedTokenUsernameProvidedTest(
    secureRedact.fetchToken,
    secureRedact.downloadMedia,
    {
      mediaId: requestParams.mediaId,
      outputPath: requestParams.outputPath
    }
  );

  test('fails if outputPath does not exist', async ctx => {
    const error = 'terrible error';
    ctx.mock.method(fsPromises, 'access', async () => {
      throw new Error(error);
    });
    await assert.rejects(
      async () =>
        await secureRedact.downloadMedia({
          mediaId: requestParams.mediaId,
          outputPath: requestParams.outputPath
        }),
      {
        name: 'SecureRedactError',
        statusCode: 500,
        message: `Cannot access output path\nError: ${error}`
      }
    );
  });

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
          mediaId: requestParams.mediaId,
          outputPath: requestParams.outputPath
        }),
      {
        name: 'SecureRedactError',
        statusCode: 500,
        message: 'Received invalid response: Internal Server Error'
      }
    );
  });

  test('fails if write stream fails', async ctx => {
    const badError = 'bad error';
    ctx.mock.method(fs, 'createWriteStream', () => {
      return {
        write: () => {},
        on: (event: string, handler: (err: Error) => void) => {
          if (event === 'error') {
            handler(new Error(badError));
          }
          return null;
        }
      };
    });

    await assert.rejects(
      async () =>
        await secureRedact.downloadMedia({
          mediaId: requestParams.mediaId,
          outputPath: requestParams.outputPath
        }),
      {
        name: 'SecureRedactError',
        statusCode: 500,
        message: badError
      }
    );
  });

  test('saves file to disk', async ctx => {
    const writeSpy = mock.fn();
    ctx.mock.method(fs, 'createWriteStream', () => {
      return {
        write: writeSpy,
        on: (event: string, handler: () => void) => {
          if (event === 'finish') {
            handler();
          }
          return null;
        }
      };
    });
    await secureRedact.downloadMedia({
      mediaId: requestParams.mediaId,
      outputPath: requestParams.outputPath
    });
    assert.strictEqual(writeSpy.mock.calls.length, 1);
    assert.deepStrictEqual(
      writeSpy.mock.calls[0].arguments[0],
      Buffer.from(dummyArrayBuffer)
    );
  });

  test('download suceeds', async () => {
    assert.doesNotReject(async () => {
      await secureRedact.downloadMedia({
        mediaId: requestParams.mediaId,
        outputPath: requestParams.outputPath
      });
    });
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
            ctx.set('Content-Length', dummyArrayBuffer.byteLength.toString()),
            ctx.body(dummyArrayBuffer)
          );
        }
      )
    );
    await secureRedact.downloadMedia({
      mediaId: requestParams.mediaId,
      outputPath: requestParams.outputPath
    });
  });

  test('saves to correct path', async ctx => {
    const createWriteStreamSpy = ctx.mock.method(
      fs,
      'createWriteStream',
      () => {
        return {
          write: () => {},
          on: (event: string, handler: () => void) => {
            if (event === 'finish') {
              handler();
            }
            return null;
          }
        };
      }
    );
    await secureRedact.downloadMedia({
      mediaId: requestParams.mediaId,
      outputPath: requestParams.outputPath
    });
    assert.strictEqual(createWriteStreamSpy.mock.calls.length, 1);
    assert.deepStrictEqual(
      createWriteStreamSpy.mock.calls[0].arguments[0],
      requestParams.outputPath
    );
  });
});

import { test, describe, before, afterEach, after } from 'node:test';
import * as assert from 'node:assert';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { SecureRedactRequest } from '../SecureRedactRequest.ts';

const validData = { token: 'valid_token' };
const authToken = 'valid_auth_header_token';

// have to do this to parse the URL search params correctly
type ErrorStatusCodes = Record<string, string>;
const errorStatusCodes: ErrorStatusCodes = {
  '400': 'Bad request',
  '401': 'Unauthorized',
  '403': 'Forbidden',
  '404': 'Not found',
  '500': 'Internal Server Error'
};

const server = setupServer(
  rest.get('http://localhost:3000/200', (req, res, ctx) => {
    if (req.headers.get('authorization') === authToken) {
      return res(ctx.status(200), ctx.json(validData));
    } else {
      return res(ctx.status(200), ctx.json({ error: 'body error' }));
    }
  }),
  rest.get('http://localhost:3000', (req, res, ctx) => {
    const errorKey = req.url.searchParams.get('errorKey');
    if (!errorKey || !(errorKey in errorStatusCodes)) {
      return res(ctx.status(500), ctx.json({ error: 'Invalid status code' }));
    }
    return res(
      ctx.status(parseInt(errorKey)),
      ctx.json({ error: errorStatusCodes[errorKey] })
    );
  }),
  rest.get('http://localhost:3000/bad_json', (req, res, ctx) => {
    return res(ctx.status(200), ctx.text('bad json'));
  })
);

describe('testing makeRequest utility function', () => {
  before(() => server.listen());
  afterEach(() => server.resetHandlers());
  after(() => server.close());

  for (const [errorCode, errorMessage] of Object.entries(errorStatusCodes)) {
    test(`throws error on ${errorCode}`, async () => {
      await assert.rejects(
        async () => {
          await SecureRedactRequest.makeRequest(
            `http://localhost:3000?errorKey=${errorCode}`,
            {
              headers: {
                accept: 'application/json'
              }
            }
          );
        },
        {
          name: 'SecureRedactError',
          message: `Received invalid response: ${errorMessage}`,
          statusCode: parseInt(errorCode)
        }
      );
    });
  }
  test('throws error on bad json', async () => {
    await assert.rejects(
      async () => {
        await SecureRedactRequest.makeRequest(
          'http://localhost:3000/bad_json',
          {
            headers: {
              accept: 'application/json'
            }
          }
        );
      },
      {
        name: 'SecureRedactError',
        message: 'Unexpected token \'b\', "bad json" is not valid JSON',
        statusCode: 500
      }
    );
  });
  test('throws if no auth header provided', async () => {
    await assert.rejects(
      async () => {
        await SecureRedactRequest.makeRequest('http://localhost:3000/200', {
          headers: {
            accept: 'application/json'
          }
        });
      },
      {
        name: 'SecureRedactError',
        message: 'Received invalid response: body error',
        statusCode: 200
      }
    );
  });
  test('resolves if auth header provided', async () => {
    const response = await SecureRedactRequest.makeRequest(
      'http://localhost:3000/200',
      {
        headers: {
          Accept: 'application/json',
          Authorization: authToken
        }
      }
    );
    assert.deepStrictEqual(response, validData);
  });
});

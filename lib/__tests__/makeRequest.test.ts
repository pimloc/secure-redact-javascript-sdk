import { test, describe, before, afterEach, after } from 'node:test';
import * as assert from 'node:assert';
import { makeRequest } from '../utils/makeRequest.ts';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const validData = { token: 'valid_token' };
const authToken = 'valid_auth_header_token';

const server = setupServer(
  rest.get('http://localhost:3000/200', (req, res, ctx) => {
    console.log(req.headers);
    if (req.headers.get('authorization') === authToken) {
      return res(ctx.status(200), ctx.json(validData));
    } else {
      return res(ctx.status(401), ctx.json({ error: 'Unauthorized' }));
    }
  }),
  rest.get('http://localhost:3000/400', (req, res, ctx) => {
    return res(ctx.status(400), ctx.json({ error: 'Bad request' }));
  }),
  rest.get('http://localhost:3000/401', (req, res, ctx) => {
    return res(ctx.status(401), ctx.json({ error: 'Unauthorized' }));
  }),
  rest.get('http://localhost:3000/403', (req, res, ctx) => {
    return res(ctx.status(403), ctx.json({ error: 'Forbidden' }));
  }),
  rest.get('http://localhost:3000/404', (req, res, ctx) => {
    return res(ctx.status(404), ctx.json({ error: 'Not found' }));
  }),
  rest.get('http://localhost:3000/500', (req, res, ctx) => {
    return res(ctx.status(500), ctx.json({ error: 'Internal Server Error' }));
  }),
  rest.get('http://localhost:3000/bad_json', (req, res, ctx) => {
    return res(ctx.status(200), ctx.text('bad json'));
  })
);

describe('testing makeRequest utility function', () => {
  before(() => server.listen());
  afterEach(() => server.resetHandlers());
  after(() => server.close());

  test('throws error on 400', async () => {
    await assert.rejects(
      async () => {
        await makeRequest('http://localhost:3000/400', {
          headers: {
            accept: 'application/json'
          }
        });
      },
      {
        name: 'SecureRedactError',
        message: 'Received invalid response: Bad request',
        statusCode: 400
      }
    );
  });
  test('throws error on 401', async () => {
    await assert.rejects(
      async () => {
        await makeRequest('http://localhost:3000/401', {
          headers: {
            accept: 'application/json'
          }
        });
      },
      {
        name: 'SecureRedactError',
        message: 'Received invalid response: Unauthorized',
        statusCode: 401
      }
    );
  });
  test('throws error on 403', async () => {
    await assert.rejects(
      async () => {
        await makeRequest('http://localhost:3000/403', {
          headers: {
            accept: 'application/json'
          }
        });
      },
      {
        name: 'SecureRedactError',
        message: 'Received invalid response: Forbidden',
        statusCode: 403
      }
    );
  });
  test('throws error on 404', async () => {
    await assert.rejects(
      async () => {
        await makeRequest('http://localhost:3000/404', {
          headers: {
            accept: 'application/json'
          }
        });
      },
      {
        name: 'SecureRedactError',
        message: 'Received invalid response: Not found',
        statusCode: 404
      }
    );
  });
  test('throws error on 500', async () => {
    await assert.rejects(
      async () => {
        await makeRequest('http://localhost:3000/500', {
          headers: {
            accept: 'application/json'
          }
        });
      },
      {
        name: 'SecureRedactError',
        message: 'Received invalid response: Internal Server Error',
        statusCode: 500
      }
    );
  });
  test('throws error on bad json', async () => {
    await assert.rejects(
      async () => {
        await makeRequest('http://localhost:3000/bad_json', {
          headers: {
            accept: 'application/json'
          }
        });
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
        await makeRequest('http://localhost:3000/200', {
          headers: {
            accept: 'application/json'
          }
        });
      },
      {
        name: 'SecureRedactError',
        message: 'Received invalid response: Unauthorized',
        statusCode: 401
      }
    );
  });
  test('resolves if auth header provided', async () => {
    const response = await makeRequest('http://localhost:3000/200', {
      headers: {
        Accept: 'application/json',
        Authorization: authToken
      }
    });
    assert.deepStrictEqual(response, validData);
  });
});

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
  tokenEndpointHitCallback
} from './utils';

const validResponse = {
  projects: [
    {
      projectId: 'random',
      name: 'test_project'
    }
  ]
};

const server = setupServer(
  ...defaultHandlers,
  rest.get(
    'https://app.secureredact.co.uk/api/v2/projects',
    (req, res, ctx) => {
      return res(ctx.status(200), ctx.json(validResponse));
    }
  )
);

describe('test fetchProjects functionality', () => {
  before(() => server.listen());
  beforeEach(() => tokenEndpointHitCallback.mock.resetCalls());
  afterEach(() => server.resetHandlers());
  after(() => server.close());

  const secureRedact = new SecureRedactSDK({
    clientId: creds.clientId,
    clientSecret: creds.clientSecret
  });
  authenticatedTokenTests(secureRedact.fetchToken, secureRedact.fetchProjects, {
    projects: validResponse.projects
  });

  test('fails if projects route throws', async () => {
    const badError = 'bad error';
    server.use(
      rest.get(
        'https://app.secureredact.co.uk/api/v2/projects',
        (req, res, ctx) => {
          return res(ctx.status(500), ctx.json({ error: badError }));
        }
      )
    );
    await assert.rejects(
      async () =>
        await secureRedact.fetchProjects({
          page: 0,
          pageSize: 10
        }),
      {
        name: 'SecureRedactError',
        statusCode: 500,
        message: `Received invalid response: ${badError}`
      }
    );
  });

  test('returns correct data', async () => {
    const result = await secureRedact.fetchProjects({
      page: 0,
      pageSize: 10
    });
    assert.deepStrictEqual(result, {
      projects: [
        {
          projectId: validResponse.projects[0].projectId,
          name: validResponse.projects[0].name
        }
      ]
    });
  });
});

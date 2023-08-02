/* eslint-disable @typescript-eslint/no-explicit-any */
import { test } from 'node:test';
import * as assert from 'node:assert';
import { mock } from 'node:test';
import { rest } from 'msw';

import { SecureRedactSDK } from '../SecureRedactSDK.ts';
import { SecureRedactFetchTokenParams } from '../types/lib.ts';

const creds = {
  clientId: 'clientId',
  clientSecret: 'clientSecret',
  basicToken: 'Basic Y2xpZW50SWQ6Y2xpZW50U2VjcmV0',
  bearerToken: 'dummy.jwt.token'
};

const tokenEndpointHitCallback = mock.fn();

const defaultHandlers = [
  rest.get('https://app.secureredact.co.uk/api/v2/token', (req, res, ctx) => {
    tokenEndpointHitCallback();
    if (req.headers.get('authorization') === creds.basicToken) {
      return res(
        ctx.status(200),
        ctx.json({ error: null, token: creds.bearerToken })
      );
    } else {
      return res(ctx.status(403), ctx.json({ error: 'Forbidden' }));
    }
  })
];

const invalidAuthenticatedTokenTest = (method: any, data: any) => {
  test('fails if token invalid', async () => {
    await assert.rejects(async () => await method(data), {
      name: 'SecureRedactError',
      statusCode: 403,
      message: 'Received invalid response: Forbidden'
    });
    // system should try to call token endpoint twice
    assert.strictEqual(tokenEndpointHitCallback.mock.calls.length, 2);
  });
};

const authenticatedTokenTests = (
  fetchToken: (
    arg?: SecureRedactFetchTokenParams
  ) => ReturnType<SecureRedactSDK['fetchToken']>,
  method: any,
  data: any
) => {
  test('calls token endpoint if no token', async () => {
    await method(data);
    assert.strictEqual(tokenEndpointHitCallback.mock.calls.length, 1);
  });

  test('does not call token endpoint if token', async () => {
    await fetchToken();
    tokenEndpointHitCallback.mock.resetCalls();
    await method(data);
    assert.strictEqual(tokenEndpointHitCallback.mock.calls.length, 0);
  });
};

const authenticatedTokenUsernameProvidedTest = (
  fetchToken: (
    arg?: SecureRedactFetchTokenParams
  ) => ReturnType<SecureRedactSDK['fetchToken']>,
  method: any,
  data: any
) => {
  test('calls token endpoint if username provided', async () => {
    await fetchToken();
    tokenEndpointHitCallback.mock.resetCalls();
    await method({ ...data, username: 'test@test.com' });
    assert.strictEqual(tokenEndpointHitCallback.mock.calls.length, 1);
  });
};

export {
  defaultHandlers,
  creds,
  tokenEndpointHitCallback,
  invalidAuthenticatedTokenTest,
  authenticatedTokenTests,
  authenticatedTokenUsernameProvidedTest
};

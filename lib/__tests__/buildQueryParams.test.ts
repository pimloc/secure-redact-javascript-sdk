import { test, describe } from 'node:test';
import * as assert from 'node:assert';
import { buildQueryParams } from '../utils/buildQueryParams';

describe('test buildQueryParams functionality', () => {
  test('returns empty string if no params provided', () => {
    const result = buildQueryParams({});
    assert.strictEqual(result, '');
  });
  test('returns correct string when 1 param', () => {
    const result = buildQueryParams({ test: '1' });
    assert.strictEqual(result, 'test=1');
  });
  test('returns correct string when multiple', () => {
    const result = buildQueryParams({ testA: '1', testB: '2', testC: '3' });
    assert.strictEqual(result, 'testA=1&testB=2&testC=3');
  });
});

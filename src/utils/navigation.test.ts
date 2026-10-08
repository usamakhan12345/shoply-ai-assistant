import { describe, expect, it } from 'vitest';
import { isAllowedRoute } from './navigation';

describe('isAllowedRoute', () => {
  it('accepts the known customer routes', () => {
    for (const r of ['/checkout', '/cart', '/orders', '/orders/12', '/products/5']) expect(isAllowedRoute(r)).toBe(true);
  });
  it('rejects everything else', () => {
    for (const r of ['https://evil.com', '//evil.com', 'javascript:alert(1)', '/seller/dashboard', '/orders/abc', '/orders/1/../../seller', '/admin', '', '/checkout?x=1', '/products/1/edit'])
      expect(isAllowedRoute(r)).toBe(false);
    expect(isAllowedRoute(undefined)).toBe(false);
    expect(isAllowedRoute({ route: '/cart' })).toBe(false);
  });
});

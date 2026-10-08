import { describe, expect, it } from 'vitest';
import { csv, imgUrl, money, safeRedirect } from './format';

describe('safeRedirect', () => {
  it('allows same-site paths', () => {
    expect(safeRedirect('/cart?x=1')).toBe('/cart?x=1');
  });
  it('blocks external / protocol-relative targets', () => {
    expect(safeRedirect('https://evil.com')).toBe('/');
    expect(safeRedirect('//evil.com')).toBe('/');
    expect(safeRedirect(null, '/home')).toBe('/home');
  });
});

describe('formatting', () => {
  it('formats money', () => expect(money(5999)).toBe('Rs. 5,999'));
  it('parses comma lists', () => expect(csv(' a, b ,,c ')).toEqual(['a', 'b', 'c']));
  it('resolves image urls', () => {
    expect(imgUrl('https://x.com/a.png')).toBe('https://x.com/a.png');
    expect(imgUrl('/uploads/a.png')).toContain('/uploads/a.png');
    expect(imgUrl(null)).toContain('data:image/svg+xml');
  });
});

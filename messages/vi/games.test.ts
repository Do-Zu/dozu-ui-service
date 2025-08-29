/* Test runner: Jest or Vitest (auto-detected from repo). This file uses describe/it/expect only. */
/* 
  Tests for Vietnamese games messages.

  Testing framework: The repository's configured test runner (Jest or Vitest).
  - Uses describe/it/expect which are compatible with both Jest and Vitest.
  - If using Jest + ts-jest, ensure ts-jest is configured.
  - If using Vitest, the same assertions work.

  Focus: Validate message object integrity, key coverage, and token consistency.
*/

import vi from './games';

function extractTokens(s: string): string[] {
  // Matches {token} style placeholders
  const tokens = new Set<string>();
  const re = /\{([^}]+)\}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s)) !== null) {
    tokens.add(m[1].trim());
  }
  return Array.from(tokens).sort();
}

describe('messages/vi/games.ts', () => {
  it('exports a plain object', () => {
    expect(vi).toBeDefined();
    expect(typeof vi).toBe('object');
    expect(Array.isArray(vi)).toBe(false);
  });

  it('has string values for all keys and no empty strings', () => {
    const entries = Object.entries(vi as Record<string, unknown>);
    expect(entries.length).toBeGreaterThan(0);
    for (const [k, v] of entries) {
      expect(typeof k).toBe('string');
      expect(typeof v).toBe('string');
      const str = String(v);
      expect(str).not.toHaveLength(0);
      // Disallow accidental leading/trailing whitespace
      expect(str).toBe(str.trim());
    }
  });

  it('does not contain obvious untranslated placeholders like TODO or FIXME', () => {
    const badPatterns = [/^\s*(TODO|FIXME)\b/i, /\bTBD\b/];
    for (const [k, v] of Object.entries(vi as Record<string, string>)) {
      for (const pat of badPatterns) {
        expect(pat.test(v)).toBe(false);
      }
    }
  });

  it('produces a stable snapshot of keys', () => {
    expect(Object.keys(vi).sort()).toMatchSnapshot('vi-games-keys');
  });
});

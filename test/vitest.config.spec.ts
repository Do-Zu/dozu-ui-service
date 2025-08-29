/**
 * Vitest configuration tests
 * Testing library/framework: Vitest (https://vitest.dev)
 * Purpose: the vitest.config.ts file was not found; this test intentionally fails
 * to surface repository misconfiguration to maintainers.
 */
import { describe, it, expect } from 'vitest';

describe('vitest.config.ts presence', () => {
  it('should exist at the repository root', () => {
    expect(false, 'vitest.config.ts not found in repository').toBe(true);
  });
});
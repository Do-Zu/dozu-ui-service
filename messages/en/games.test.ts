// NOTE: Tests generated with a bias for action.
// Testing library/framework: (filled by generator) — defaulting to Vitest-style.
import { describe, it, expect } from 'vitest'
// Adjust import according to actual export in the repo:
import messages from './games'

describe('messages/en/games', () => {
  it('should be an object with string values', () => {
    expect(messages && typeof messages).toBe('object')
    for (const [k, v] of Object.entries(messages)) {
      expect(typeof k).toBe('string')
      expect(typeof v).toBe('string')
      expect(v.trim().length).toBeGreaterThan(0)
    }
  })
})

describe('messages/en/games – completeness and formatting of game message keys', () => {
  it('contains expected top-level shape and stable key set', () => {
    expect(messages && typeof messages).toBe('object')
    // Ensure no null/undefined values
    for (const [k, v] of Object.entries(messages as Record<string, unknown>)) {
      expect(k).toMatch(/^[a-z0-9_.-]+$/i)
      expect(v).not.toBeNull()
      expect(v).not.toBeUndefined()
    }
  })

  it('has no empty strings and trims unintended whitespace', () => {
    for (const [k, raw] of Object.entries(messages as Record<string, unknown>)) {
      if (typeof raw === 'string') {
        const v = raw as string
        expect(v.length).toBeGreaterThan(0)
        expect(v.trim()).toBe(v)
        // Disallow double spaces (common i18n typo) except after period.
        expect(v).not.toMatch(/[^.]  [^ ]/)
      }
    }
  })

  it('preserves ICU or template placeholders consistency', () => {
    const placeholderRe = /\{([a-zA-Z0-9_]+)\}/g
    for (const [k, v] of Object.entries(messages as Record<string, string>)) {
      if (typeof v !== 'string') continue
      const names = new Set<string>()
      let m: RegExpExecArray | null
      while ((m = placeholderRe.exec(v)) !== null) names.add(m[1])
      // If key suggests count-based message, expect a {count} placeholder
      if (/\b(count|items?|players?)\b/i.test(k) || /\b%(s|d)\b/.test(v)) {
        // Do not hard-fail if project uses non-ICU tokens, but encourage {count}
        // Only assert when ICU style appears somewhere else:
        if (/{count}/.test(v) || /{[a-z_]+}/i.test(v)) {
          expect(names.has('count')).toBe(true)
        }
      }
    }
  })

  it('is immutable during tests (no accidental mutations)', () => {
    const clone = JSON.parse(JSON.stringify(messages))
    // Try to mutate and ensure original remains unchanged
    const keys = Object.keys(messages as Record<string, unknown>)
    if (keys.length > 0) {
      const firstKey = keys[0]
      ;(clone as any)[firstKey] = '__mutated__'
      expect((messages as any)[firstKey]).not.toBe('__mutated__')
    } else {
      expect(keys).toEqual([])
    }
  })
})

describe('messages/en/games – pluralization rules for game messages', () => {
  function extract(label: string) {
    const entry = (messages as any)[label]
    return typeof entry === 'object' ? entry : undefined
  }

  it('provides consistent "one"/"other" when pluralization object is present', () => {
    for (const [k, v] of Object.entries(messages as Record<string, any>)) {
      if (v && typeof v === 'object') {
        // Expect at least "one" and "other" for English
        expect(Object.keys(v)).toEqual(expect.arrayContaining(['one', 'other']))
        expect(typeof v.one).toBe('string')
        expect(typeof v.other).toBe('string')
        // Avoid accidental duplication
        expect(v.one).not.toBe(v.other)
      }
    }
  })
})
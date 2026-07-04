import { MatchOptions } from '../models/keyword-rule.model';
import { buildRegex, escapeRegex } from './regex.util';

/**
 * Build a minimal rule-shaped object for `buildRegex`. We don't need the full
 * KeywordRule (id/replace/enabled) since `buildRegex` only reads `find` + `options`.
 */
function rule(find: string, options: Partial<MatchOptions> = {}): { find: string; options: MatchOptions } {
  return {
    find,
    options: {
      caseSensitive: false,
      wholeWord: false,
      regex: false,
      ...options,
    },
  };
}

/** Convenience: count matches of `re` in `s`. */
function countMatches(re: RegExp, s: string): number {
  return Array.from(s.matchAll(re)).length;
}

describe('escapeRegex', () => {
  it('escapes every regex metacharacter', () => {
    const input = '\\^$.*+?()[]{}|/';
    const escaped = escapeRegex(input);
    // Every char in the input should be preceded by a backslash in the output.
    expect(escaped).toBe('\\\\\\^\\$\\.\\*\\+\\?\\(\\)\\[\\]\\{\\}\\|\\/');
    // And the escaped string, used as a regex, should match the original literally.
    expect(new RegExp(escaped).test(input)).toBe(true);
  });

  it('leaves ordinary characters alone', () => {
    expect(escapeRegex('hello world 123')).toBe('hello world 123');
  });

  it('returns empty for empty input', () => {
    expect(escapeRegex('')).toBe('');
  });
});

describe('buildRegex — invalid input', () => {
  it('returns null for empty find', () => {
    expect(buildRegex(rule(''))).toBeNull();
  });

  it('returns null for syntactically invalid regex when regex=true', () => {
    expect(buildRegex(rule('(unclosed', { regex: true }))).toBeNull();
  });

  it('still returns a regex when find contains metacharacters in literal mode', () => {
    // `(unclosed` is invalid as a pattern but fine as a literal.
    const re = buildRegex(rule('(unclosed'));
    expect(re).not.toBeNull();
    expect(re!.test('foo (unclosed bar')).toBe(true);
  });
});

describe('buildRegex — flags', () => {
  it('always sets global + unicode', () => {
    const re = buildRegex(rule('x'))!;
    expect(re.flags).toContain('g');
    expect(re.flags).toContain('u');
  });

  it('omits "i" when caseSensitive=true', () => {
    const re = buildRegex(rule('x', { caseSensitive: true }))!;
    expect(re.flags).not.toContain('i');
  });

  it('adds "i" when caseSensitive=false', () => {
    const re = buildRegex(rule('x', { caseSensitive: false }))!;
    expect(re.flags).toContain('i');
  });
});

describe('buildRegex — literal mode', () => {
  it('case-insensitive (default): matches every case variant', () => {
    const re = buildRegex(rule('foo'))!;
    expect(countMatches(re, 'foo Foo FOO fOo')).toBe(4);
  });

  it('case-sensitive: matches only exact case', () => {
    const re = buildRegex(rule('foo', { caseSensitive: true }))!;
    expect(countMatches(re, 'foo Foo FOO fOo')).toBe(1);
  });

  it('treats metacharacters as literal', () => {
    // Fresh regex per assertion — global regex .test() advances lastIndex.
    const mk = () => buildRegex(rule('a.b', { caseSensitive: true }))!;
    expect(mk().test('a.b')).toBe(true);
    expect(mk().test('aXb')).toBe(false); // would match if "." were a metachar
  });

  it('handles parentheses, pipes, and brackets literally', () => {
    const mk = () => buildRegex(rule('foo|bar', { caseSensitive: true }))!;
    expect(mk().test('foo|bar')).toBe(true);
    expect(mk().test('foo')).toBe(false); // not an alternation
    expect(mk().test('bar')).toBe(false);
  });

  it('matches across surrogate pairs (unicode flag)', () => {
    const re = buildRegex(rule('😀'))!;
    expect(countMatches(re, 'hi 😀 there 😀')).toBe(2);
  });
});

describe('buildRegex — wholeWord mode', () => {
  it('matches only whole words', () => {
    const re = buildRegex(rule('cat', { wholeWord: true, caseSensitive: true }))!;
    expect(countMatches(re, 'a cat sat on a category catalog')).toBe(1);
  });

  it('whole-word combines with case-insensitivity', () => {
    const re = buildRegex(rule('cat', { wholeWord: true }))!;
    expect(countMatches(re, 'Cat cat CAT category')).toBe(3);
  });

  it('escapes metacharacters before applying word boundaries', () => {
    // The literal find is `a.b`. As a literal whole word, "a.b" doesn't sit
    // at a word boundary because `.` is non-word — so the pattern resolves
    // to `\ba\.b\b`, which only matches when surrounded by non-word.
    const re = buildRegex(rule('a.b', { wholeWord: true, caseSensitive: true }))!;
    expect(re.test('say a.b loud')).toBe(true);
  });
});

describe('buildRegex — regex mode', () => {
  it('treats find as a real pattern', () => {
    // Fresh regex per assertion: buildRegex returns a global regex and
    // RegExp.test() advances lastIndex, so reusing one instance is stateful.
    expect(buildRegex(rule('a.b', { regex: true, caseSensitive: true }))!.test('aXb')).toBe(true);
    expect(buildRegex(rule('a.b', { regex: true, caseSensitive: true }))!.test('a.b')).toBe(true);
  });

  it('supports alternation', () => {
    const re = buildRegex(rule('foo|bar', { regex: true, caseSensitive: true }))!;
    expect(countMatches(re, 'foo bar baz foo')).toBe(3);
  });

  it('combines regex + wholeWord', () => {
    // `\d+` as whole word — matches digit runs that aren't glued to letters.
    const re = buildRegex(rule('\\d+', { regex: true, wholeWord: true, caseSensitive: true }))!;
    expect(countMatches(re, 'pick 42 not abc123 but 7')).toBe(2); // 42 and 7
  });

  it('combines regex + case-insensitive', () => {
    // Fresh regex per assertion — see note above on stateful global RegExp.test().
    const mk = () => buildRegex(rule('h(e|3)llo', { regex: true }))!;
    expect(mk().test('Hello')).toBe(true);
    expect(mk().test('H3LLO')).toBe(true);
    expect(mk().test('hxllo')).toBe(false);
  });
});

describe('buildRegex — usage with replace', () => {
  it('replaces every occurrence (global flag) — literal', () => {
    const re = buildRegex(rule('foo', { caseSensitive: true }))!;
    expect('foo foo foo'.replace(re, 'bar')).toBe('bar bar bar');
  });

  it('replaces every occurrence — case-insensitive', () => {
    const re = buildRegex(rule('foo'))!;
    expect('Foo foo FOO'.replace(re, 'bar')).toBe('bar bar bar');
  });

  it('replace string with $-sigils does NOT need escaping in the find side', () => {
    // We're only testing that find-side escaping works; replace-side escaping
    // is the caller's responsibility (and will be handled by ReplacementEngineService).
    const re = buildRegex(rule('$10', { caseSensitive: true }))!;
    expect('price: $10 vs $100'.replace(re, 'X')).toBe('price: X vs X0');
  });
});

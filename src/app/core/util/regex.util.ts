import { KeywordRule, MatchOptions } from '../models/keyword-rule.model';

/**
 * Characters that have special meaning inside a JavaScript regex pattern.
 * Used by {@link escapeRegex} to turn a literal `find` string into a safe
 * regex source.
 */
const REGEX_SPECIAL_CHARS = /[\\^$.*+?()[\]{}|/]/g;

/**
 * Escape every regex metacharacter in `s` so the result matches `s` literally.
 *
 * Forward-slash is included because the engine never wraps patterns in `/.../ `
 * literals, but escaping it costs nothing and keeps copy/paste of the source
 * safe.
 */
export function escapeRegex(s: string): string {
  return s.replace(REGEX_SPECIAL_CHARS, '\\$&');
}

/**
 * Build a global `RegExp` for `rule` honouring its {@link MatchOptions}.
 *
 * Returns `null` when the rule cannot produce a usable matcher:
 *   - empty `find`
 *   - `options.regex` is true and `find` is not a syntactically-valid pattern
 *
 * The returned regex is always **global** (`g` flag) so callers can use
 * `String.prototype.matchAll` / `replace` to find every occurrence.
 *
 * Behaviour:
 *   - Literal mode escapes every metacharacter in `find`.
 *   - Regex mode passes `find` through unchanged.
 *   - `wholeWord` wraps the (possibly already-escaped) pattern in `\b…\b`.
 *     This uses JavaScript's ASCII word-boundary semantics — Unicode word
 *     boundaries are out of scope for v1.
 *   - `caseSensitive: false` adds the `i` flag.
 *   - The `u` flag is always set so surrogate pairs are treated as single
 *     code points.
 */
export function buildRegex(rule: KeywordRule | { find: string; options: MatchOptions }): RegExp | null {
  const { find, options } = rule;
  if (!find) {
    return null;
  }

  const body = options.regex ? find : escapeRegex(find);
  const source = options.wholeWord ? `\\b(?:${body})\\b` : body;

  let flags = 'gu';
  if (!options.caseSensitive) {
    flags += 'i';
  }

  try {
    return new RegExp(source, flags);
  } catch {
    // Invalid user-supplied regex — surface as "no match" rather than throwing.
    return null;
  }
}

/**
 * Options controlling how a single keyword rule matches against text.
 *
 * - `caseSensitive`: when false, the match ignores case.
 * - `wholeWord`: when true, only whole-word occurrences match (regex word-boundary).
 * - `regex`: when true, `find` is interpreted as a regular expression; otherwise as a literal.
 */
export interface MatchOptions {
  readonly caseSensitive: boolean;
  readonly wholeWord: boolean;
  readonly regex: boolean;
}

/**
 * A single find/replace rule. Rules are applied in declared order.
 *
 * `id` is a uuid — stable across renders so tables/diff highlights can key by it.
 * `enabled = false` means the rule is kept in the set but skipped at match time.
 */
export interface KeywordRule {
  readonly id: string;
  readonly find: string;
  readonly replace: string;
  readonly options: MatchOptions;
  readonly enabled: boolean;
}

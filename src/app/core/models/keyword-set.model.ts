import { KeywordRule } from './keyword-rule.model';

/**
 * A named, reusable collection of rules.
 *
 * Persisted to IndexedDB in M3. Timestamps are epoch milliseconds.
 */
export interface KeywordSet {
  readonly id: string;
  readonly name: string;
  readonly rules: readonly KeywordRule[];
  readonly createdAt: number;
  readonly updatedAt: number;
}

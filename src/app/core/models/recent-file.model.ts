/**
 * Audit record of a processed file.
 *
 * **METADATA ONLY** — bytes are never persisted (privacy guarantee).
 * Stored in IndexedDB in M4 with a cap of 50 entries, evicted by `processedAt`.
 */
export interface RecentFileMeta {
  readonly id: string;
  readonly name: string;
  readonly size: number;
  readonly mime: string;
  /** `DocumentHandler.id` that processed the file. */
  readonly handlerId: string;
  /** Epoch milliseconds. */
  readonly processedAt: number;
  /** Set if the run used a saved keyword set; null/undefined for ad-hoc rules. */
  readonly ruleSetId?: string;
  readonly matchCount: number;
}

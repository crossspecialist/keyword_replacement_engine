import { KeywordRule } from './keyword-rule.model';
import { DiffSegment, MatchList } from './replaced-result.model';

/**
 * Pluggable per-format pipeline: parse → replace → serialize → preview.
 *
 * Implementations are registered via the `HANDLERS` injection token and
 * resolved by `HandlerRegistryService` based on MIME / extension.
 *
 * `TParsed` is opaque to the registry; each handler knows its own shape
 * (e.g. `string` for TXT, `Document` for HTML, `{ zip, xml }` for DOCX).
 *
 * `preview` returns either:
 *   - `DiffSegment[]` — for textual formats that can show a true diff
 *   - `MatchList`     — for PDF / image, where we show a list of matches with thumbnails
 */
export interface DocumentHandler<TParsed> {
  /** Short stable id used for logging, recent-files metadata, and tests. */
  readonly id: string;

  /** True if this handler should be used for the given file. */
  canHandle(file: File): boolean;

  /** Parse a file into the handler's internal representation. */
  parse(file: File): Promise<TParsed>;

  /** Produce a new parsed value with rules applied. Must not mutate input. */
  replace(parsed: TParsed, rules: readonly KeywordRule[]): Promise<TParsed>;

  /** Serialize the (replaced) parsed value back to a downloadable Blob. */
  serialize(replaced: TParsed): Promise<Blob>;

  /**
   * Cheap preview of what `replace` would do, used by the diff/confirm step.
   * Must not perform any heavier work than `replace`.
   */
  preview(parsed: TParsed, rules: readonly KeywordRule[]): Promise<DiffSegment[] | MatchList>;
}

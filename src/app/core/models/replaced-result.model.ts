/**
 * Outcome of running the replacement engine on a single string.
 *
 * `perRule` is keyed by `KeywordRule.id` so the UI can show counts per row.
 */
export interface ReplacedResult {
  readonly output: string;
  readonly matchCount: number;
  readonly perRule: ReadonlyMap<string, number>;
}

/**
 * One contiguous piece of a textual diff between the original and replaced content.
 *
 * `ruleId` is set on `removed`/`added` segments to attribute the change to a rule.
 */
export type DiffSegment =
  | { readonly kind: 'equal'; readonly text: string }
  | { readonly kind: 'removed'; readonly text: string; readonly ruleId?: string }
  | { readonly kind: 'added'; readonly text: string; readonly ruleId?: string };

/**
 * Axis-aligned bounding box. Coordinates are in the source document's units
 * (PDF user-space points or image pixels) — handlers document their own unit.
 */
export interface BBox {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}

/**
 * One match in a non-textual format (PDF / image). Used by handlers whose
 * preview can't be expressed as a textual diff. `thumbnailDataUrl` is a small
 * cropped PNG/JPEG (base64) suitable for inline rendering.
 */
export interface MatchListItem {
  readonly ruleId: string;
  readonly find: string;
  readonly replace: string;
  readonly location: {
    readonly page?: number;
    readonly bbox?: BBox;
  };
  readonly thumbnailDataUrl?: string;
}

export interface MatchList {
  readonly kind: 'match-list';
  readonly items: readonly MatchListItem[];
}

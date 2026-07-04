/**
 * Domain-specific errors surfaced by handlers and the registry.
 *
 * All extend `Error` with a stable string `kind` discriminant so callers can
 * `switch` on the kind without relying on `instanceof` (which is unreliable
 * across Web Worker / main-thread boundaries).
 */

export type DocumentErrorKind = 'unsupported-format' | 'parse' | 'serialize';

/** Base class for every document-pipeline error. */
export abstract class DocumentError extends Error {
  abstract readonly kind: DocumentErrorKind;

  protected constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    // Keep the prototype chain intact when targeting ES2022+.
    this.name = new.target.name;
  }
}

/** No registered handler accepted the given file. */
export class UnsupportedFormatError extends DocumentError {
  readonly kind = 'unsupported-format' as const;

  constructor(
    public readonly fileName: string,
    public readonly mime: string,
  ) {
    super(`Unsupported file format: "${fileName}" (mime: "${mime || 'unknown'}")`);
  }
}

/** A handler failed to parse a file (corrupt, encrypted, unexpected structure). */
export class ParseError extends DocumentError {
  readonly kind = 'parse' as const;

  constructor(
    public readonly handlerId: string,
    message: string,
    options?: { cause?: unknown },
  ) {
    super(`[${handlerId}] parse failed: ${message}`, options);
  }
}

/** A handler failed to serialize a replaced document back to a Blob. */
export class SerializeError extends DocumentError {
  readonly kind = 'serialize' as const;

  constructor(
    public readonly handlerId: string,
    message: string,
    options?: { cause?: unknown },
  ) {
    super(`[${handlerId}] serialize failed: ${message}`, options);
  }
}

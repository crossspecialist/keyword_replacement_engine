import { InjectionToken } from '@angular/core';
import { DocumentHandler } from '../models/document-handler.model';

/**
 * Multi-provider token for every registered `DocumentHandler`.
 *
 * No providers are wired in M0 — handlers are added one milestone at a time
 * starting with `TxtHandler` in M1. Consumed by `HandlerRegistryService`.
 *
 * Providers should use `multi: true`, e.g.:
 *   { provide: HANDLERS, useClass: TxtHandler, multi: true }
 */
export const HANDLERS = new InjectionToken<readonly DocumentHandler<unknown>[]>('HANDLERS');

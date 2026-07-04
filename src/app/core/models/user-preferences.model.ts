/**
 * Persisted user defaults. Loaded once at startup by `PreferencesService` (M3)
 * and exposed as a signal.
 *
 * `confirmBeforeDownload` is locked to `true` in v1 — the diff/confirm step
 * is mandatory regardless of preference. The field exists so a future version
 * can relax it without a schema bump.
 */
export interface UserPreferences {
  readonly defaultCaseSensitive: boolean;
  readonly defaultRegex: boolean;
  readonly defaultWholeWord: boolean;
  readonly ocrLanguage: 'eng';
  readonly confirmBeforeDownload: true;
}

/** Default preferences applied on first run. */
export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  defaultCaseSensitive: false,
  defaultRegex: false,
  defaultWholeWord: false,
  ocrLanguage: 'eng',
  confirmBeforeDownload: true,
};

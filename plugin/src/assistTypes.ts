import {CurrentUser} from 'sanity'

export interface AssistConfig {
  /**
   * As of v3.0 Assist can write to date and datetime fields.
   *
   * If this function is omitted from config, the plugin will use the default timeZone and locale
   * in the browser:
   *
   * ```ts
   * const {timeZone, locale} = Intl.DateTimeFormat().resolvedOptions()
   * ```
   *
   * The function will be called any time an instruction runs.
   *
   * @see #LocaleSettings.locale
   * @see #LocaleSettings.timeZone
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl#getcanonicalocales
   * @see https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
   */
  localeSettings?: (context: LocaleSettingsContext) => LocaleSettings

  /**
   * The max depth for document paths AI Assist will write to.
   *
   * Depth is based on field path segments:
   * - `title` has depth 1
   * - `array[_key="no"].title` has depth 3
   *
   * Be careful not to set this too high in studios with recursive document schemas, as it could have
   * negative impact on performance.
   *
   * Depth will be counted from the field the instruction is run from. For example, if an instruction
   * is attached to depth 6, the count starts from there (at 0, not at 6).
   *
   * Default: 4
   */
  maxPathDepth?: number

  /**
   * Influences how much the output of an instruction will vary.
   *
   * Min: 0 – re-running an instruction will often produce the same outcomes
   * Max: 1 – re-running an instruction can produce wildly different outcomes
   *
   * This parameter applies to _all_ instructions in the studio.
   *
   * Prior to v3.0, this defaulted to 0
   *
   * Default: 0.3
   */
  temperature?: number
}

export interface LocaleSettingsContext {
  user: CurrentUser
  defaultSettings: LocaleSettings
}

export interface LocaleSettings {
  /**
   * A valid Unicode BCP 47 locale identifier used to interpret and format
   * natural language inputs and date output. Examples include "en-US", "fr-FR", or "ja-JP".
   *
   * This affects how phrases like "next Friday" or "in two weeks" are parsed,
   * and how resulting dates are presented (e.g., 12-hour vs 24-hour format).
   *
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl#getcanonicalocales
   */
  locale: string

  /**
   * A valid IANA time zone identifier used to resolve relative and absolute
   * date expressions to a specific point in time. Examples include
   * "America/New_York", "Europe/Paris", or "Asia/Tokyo".
   *
   * This ensures phrases like "tomorrow at 9am" are interpreted correctly
   * based on the user's local time.
   *
   * @see https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
   */
  timeZone: string
}

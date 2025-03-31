import {LocaleSettings, LocaleSettingsContext} from './plugin'

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
   * Depth will be counted from the field the instruction is run from. Ie, if an instruction
   * is attached to say, depth 6, count starts from there (at 0, not at 6).
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

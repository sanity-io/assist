import {ObjectSchemaType, Path, SanityClient, SchemaType} from 'sanity'

export interface Language {
  id: string
  title?: string
}

export interface DocumentMember {
  schemaType: SchemaType
  path: Path
  name: string
  value: unknown
}

export interface TranslationOutput {
  /** Language id */
  id: string
  outputPath: Path
}

export type TranslationOutputsFunction = (
  documentMember: DocumentMember,
  enclosingType: SchemaType,
  translateFromLanguageId: string,
  translateToLanguageIds: string[],
) => TranslationOutput[] | undefined

export type LanguageCallback = (
  client: SanityClient,
  selectedLanguageParams: Record<string, unknown>,
) => Promise<Language[]>

export interface FieldTranslationConfig {
  /**
   * `documentTypes` should be an array of strings where each entry must match a name from your document schemas.
   *
   * If defined, matching document will get a "Translate fields" instruction added.
   **/
  documentTypes?: string[]

  /**
   *
   * Used for display strings in the Studio, and to determine languages for field level translations
   *
   * If the studio is using the sanity-plugin-internationalized-array plugin, this
   * should be set to the same configuration.
   */
  languages: Language[] | LanguageCallback

  /**
   * API version for client passed to LanguageCallback for languages
   * https://www.sanity.io/docs/api-versioning
   * @defaultValue '2022-11-27'
   */
  apiVersion?: string

  /**
   * Specify fields that should be available in the languages callback:
   * ```tsx
   * {
   *   select: {
   *     markets: 'markets'
   *   },
   *   languages: (client, {markets}) =>
   *     client.fetch('*[_type == "language" && market in $markets]{id,title}', {markets})
   * }
   * ```
   *
   * If the studio is using the sanity-plugin-internationalized-array plugin, this
   * should be set to the same configuration.
   */
  selectLanguageParams?: Record<string, string>

  /**
   * `translationOutputs` is used when the "Translate fields" instruction is started by a Studio user.
   *
   *  It determines the relationships between document paths: Given a document path and a language, into which
   *  sibling paths should translations be output.
   *
   * `translationOutputs` is invoked once per path in the document (limited to a depth of 6), with the following:
   *
   *  * `documentMember` - the field or array item for a given path; contains the path and its schemaType,
   *  * `enclosingType` - the schema type of parent holding the member
   *  * `translateFromLanguageId` - the languageId for the language the user want to translate from
   *  * `translateToLanguageIds` - all languageIds the user can translate to
   *
   * The function should return a `TranslationOutput[]` array that contains all the paths where translations from
   * documentMember language (translateFromLanguageId) should be output.
   *
   * The function should return `undefined` for all documentMembers that should not be directly translated,
   * or are nested fields under a translated path.
   *
   * ## Default function
   *
   * The default function for `translationOutputs` is configured to be automatically compatible with sanity-plugin-internationalized-array
   * and object types prefixed with "locale".
   *
   * See <link to source for defaultTranslationOutputs> implementation details.
   *
   * ## Example
   * A document has the following document members:
   * * `{path: 'localeObject.en', schemaType: ObjectSchemaType}`
   * * `{path: 'localeObject.en.title', schemaType: StringSchemaType}`
   * * `{path: 'localeObject.de', schemaType: ObjectSchemaType}`,
   * * `{path: 'localeObject.de.title', schemaType: StringSchemaType}`
   *
   * `translationOutputs` for invoked with `translateFromLanguageId` `en`,
   * should only return [{id: 'de', outputPath: 'localeObject.de'}] for the `'localeObject.en'` path,
   * and undefined for all the other members.
   *
   * ### Example implementation
   * ```ts
   * function translationOutputs(member, enclosingType, translateFromLanguageId, translateToLanguageIds)
   *   if (enclosingType.jsonType === 'object' && enclosingType.name.startsWith('locale') && translateFromLanguageId === member.name) {
   *      return translateToLanguageIds.map((translateToId) => ({
   *         id: translateToId,
   *         outputPath: [...member.path.slice(0, -1), translateToId],
   *      }))
   *   }
   *   return undefined
   * }
   * ```
   *
   * @see #maxPathDepth
   **/
  translationOutputs?: TranslationOutputsFunction

  /**
   * The max depth for document paths AI Assist will translate.
   *
   * Depth is based on field path segments:
   * - `title` has depth 1
   * - `array[_key="no"].title` has depth 3
   *
   * Be careful not to set this too high in studios with recursive document schemas, as it could have
   * negative impact on performance.
   *
   * Default: 6
   */
  maxPathDepth?: number
}

export interface DocumentTranslationConfig {
  /**
   * Path to language field in documents. Can be a hidden field.
   * For instance: 'config.language'
   *
   * For projects that use the `@sanity/document-internationalization` plugin,
   * this should be the same as `languageField` config for that plugin.
   *
   * Default: 'language'
   */
  languageField: string

  /**
   * `documentTypes` should be an array of strings where each entry must match a name from your document schemas.
   *
   * If defined, this property will add a translate instruction to these document types.
   * If undefined, the instruction will be added to all documents with aiAssistance enabled and a field matching `documentLanguageField` config.
   *
   * Documents with translation support will get a "Translate document>" instruction added.
   **/
  documentTypes?: string[]
}

export interface TranslateStyleguideContext {
  documentId: string
  schemaType: ObjectSchemaType
  client: SanityClient
  /**
   * Only provided for field translations
   */
  translatePath?: Path
}

export type TranslateStyleguide =
  | string
  | ((context: TranslateStyleguideContext) => Promise<string>)

export interface TranslationConfig {
  /**
   * Config for document types with fields in multiple languages in the same document.
   */
  field?: FieldTranslationConfig
  /**
   * Config for document types with a single language field that determines the language for the whole document.
   */
  document?: DocumentTranslationConfig
  /**
   * A "style guide" that can be used to provide guidance on how to translate content.
   * Will be passed to the LLM - ergo this is only a guide and the model _may_ not
   * always follow it to the letter.
   *
   * When providing a function, consider caching the results of any async operation; it will invoked every time translate runs
   */
  styleguide?: TranslateStyleguide
}

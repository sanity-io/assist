/* eslint-disable no-unused-vars */
export interface AssistOptions {
  aiWritingAssistance?: {
    /** Set to true to disable assistance for this field or type */
    exclude?: boolean

    /**
     * Set to true to add translation field-action to the field.
     * Only has an effect in document types configured for document or field level translations.
     */
    translateAction?: boolean
  }
}

declare module 'sanity' {
  interface ArrayOptions extends AssistOptions {}
  interface BlockOptions extends AssistOptions {}
  interface BooleanOptions extends AssistOptions {}
  interface CrossDatasetReferenceOptions extends AssistOptions {}
  interface DateOptions extends AssistOptions {}
  interface DatetimeOptions extends AssistOptions {}
  interface DocumentOptions extends AssistOptions {}
  interface FileOptions extends AssistOptions {}
  interface GeopointOptions extends AssistOptions {}
  interface ImageOptions extends AssistOptions {
    imagePromptField?: string
    captionField?: string
  }
  interface NumberOptions extends AssistOptions {}
  interface ObjectOptions extends AssistOptions {}
  interface ReferenceBaseOptions {
    aiWritingAssistance?: {
      /** Set to true to disable assistance for this field or type */
      exclude?: boolean

      /**
       * When set, the reference field will allow instructions to be added to it.
       * Should be the name of the embeddings-index where assist will look for contextually relevant documents
       * */
      embeddingsIndex?: string
    }
  }
  interface SlugOptions extends AssistOptions {}
  interface StringOptions extends AssistOptions {}
  interface TextOptions extends AssistOptions {}
  interface UrlOptions extends AssistOptions {}
  interface EmailOptions extends AssistOptions {}
}

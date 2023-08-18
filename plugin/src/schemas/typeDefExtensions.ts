/* eslint-disable no-unused-vars */
export interface AssistOptions {
  aiWritingAssistance?: {
    /** Set to true to disable assistance for this field or type */
    exclude?: boolean
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
  interface ReferenceBaseOptions extends AssistOptions {}
  interface SlugOptions extends AssistOptions {}
  interface StringOptions extends AssistOptions {}
  interface TextOptions extends AssistOptions {}
  interface UrlOptions extends AssistOptions {}
  interface EmailOptions extends AssistOptions {}
}

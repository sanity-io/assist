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
    /**
     * When set, an image will be created whenever the `imagePromptField` is written to by
     * an AI Assist instruction.
     *
     * The value output by AI Assist will be use as an image prompt for an generative image AI.
     *
     * This means that instructions directly for the field or instructions that visit the field when running,
     * will result in the image being changed.
     *
     * `imagePromptField` must be a child-path relative to the image field.
     * ### Example
     * ```ts
     * defineType({
     *   type: 'image',
     *   name: 'articleImage',
     *   fields: [
     *     defineField({
     *       type: 'text',
     *       name: 'imagePrompt',
     *       title: 'Image prompt',
     *       rows: 2,
     *     }),
     *   ],
     *   options: {
     *     imagePromptField: 'imagePromptField',
     *   },
     * })
     * ```
     */
    imagePromptField?: string

    /**
     * When set, an image caption will be automatically created for the image.
     *
     * `captionField` must be a child-path relative to the image field.
     *
     * Whenever the image asset for the field is changed in the Studio,
     * an image caption is generated and set into the `captionField`.
     *
     * ### Example
     * ```ts
     * defineType({
     *   type: 'image',
     *   name: 'articleImage',
     *   fields: [
     *     defineField({
     *       type: 'string',
     *       name: 'altText',
     *       title: 'Alt text',
     *     }),
     *   ],
     *   options: {
     *     captionField: 'altText',
     *   },
     * })
     * ```
     */
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

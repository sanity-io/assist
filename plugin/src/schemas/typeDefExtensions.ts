import 'sanity'
/* eslint-disable no-unused-vars */
export interface AssistOptions {
  aiAssist?: {
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
  interface ImageOptions {
    aiAssist?: AssistOptions['aiAssist'] & {
      /**
       * When set, an image will be created whenever the `imageInstructionField` is written to by
       * an AI Assist instruction.
       *
       * The value output by AI Assist will be use as an image prompt for an generative image AI.
       *
       * This means that instructions directly for the field or instructions that visit the field when running,
       * will result in the image being changed.
       *
       * `imageInstructionField` must be a child-path relative to the image field, ie:
       * * field
       * * path.to.field
       *
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
       *      aiAssist: {
       *        imageInstructionField: 'imagePrompt',
       *     }
       *   },
       * })
       * ```
       */
      imageInstructionField?: string

      /**
       * When set, an image description will be automatically created for the image.
       *
       * `imageDescriptionField` must be a child-path relative to the image field, ie:
       * * field
       * * path.to.field
       *
       * Whenever the image asset for the field is changed in the Studio,
       * an image description is generated and set into the `imageDescriptionField`.
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
       *      aiAssist: {
       *        imageDescriptionField: 'altText',
       *     }
       *   },
       * })
       * ```
       */
      imageDescriptionField?:
        | string
        | {
            path: string
            /**
             * When updateOnImageChange is true (or undefined), whenever the
             * image asset changes, imageDescriptionField will be regenerated.
             *
             * default:  true
             * */
            updateOnImageChange?: boolean
          }
    }
  }
  interface NumberOptions extends AssistOptions {}
  interface ObjectOptions extends AssistOptions {}
  interface ReferenceBaseOptions {
    aiAssist?: {
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

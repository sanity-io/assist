import {defineArrayMember, defineField, defineType} from 'sanity'
import {BlockquoteIcon, WarningOutlineIcon} from '@sanity/icons'
import {languages} from '../src/lang/languages'

export const featureProduct = defineType({
  name: 'featureProduct',
  type: 'object',
  title: 'Feature Product',
  fields: [
    defineField({
      type: 'string',
      name: 'title',
      title: 'Title',
    }),
    defineField({
      name: 'nested',
      type: 'array',
      title: 'PTE',
      of: [
        defineArrayMember({
          type: 'block',
        }),
      ],
    }),
  ],
  options: {aiAssist: {translateAction: true}},
})

export const localizedPte = defineType({
  name: 'localePte',
  type: 'object',
  title: 'PTE',
  fields: languages.map((l) =>
    defineField({
      name: l.id,
      type: 'array',
      title: l.title,
      of: [
        defineArrayMember({
          type: 'block',
        }),
      ],
    }),
  ),
  options: {aiAssist: {translateAction: true}},
})

export const localeObject = defineType({
  name: 'localeObject',
  type: 'object',
  title: 'Localized object',
  fields: languages.map((l) =>
    defineField({
      name: l.id,
      type: 'object',
      title: l.title,
      fields: [
        defineField({
          type: 'string',
          name: 'title',
          title: 'Title',
        }),
        defineField({
          name: 'strings',
          type: 'array',
          title: 'String array',
          of: [{type: 'string'}],
        }),
      ],
    }),
  ),
  options: {aiAssist: {translateAction: true}},
})

export const recursiveObject = defineType({
  type: 'object',
  name: 'recursiveObject',
  title: 'Recursive',
  fields: [
    defineField({
      type: 'array',
      name: 'recursive',
      title: 'Recursive array',
      of: [{type: 'recursiveObject'}],
    }),
    defineField({
      name: 'title',
      type: 'internationalizedArrayString',
      title: 'Title',
    }),
  ],
  options: {
    aiAssist: {
      translateAction: true,
    },
  },
})

export const languageArticle = defineType({
  type: 'document',
  name: 'languageArticle',
  title: 'Field translation',
  __experimental_formPreviewTitle: false,
  preview: {
    select: {
      title: 'title',
      subtitle: 'language',
    },
  },
  fields: [
    defineField({
      type: 'string',
      name: 'title',
      title: 'Title',
    }),
    defineField({
      name: 'subtitle',
      type: 'internationalizedArrayString',
      title: 'Subtitle',
      hidden: ({parent}) => !parent?.title,
      options: {aiAssist: {translateAction: true}},
    }),
    defineField({
      name: 'localePte',
      type: localizedPte.name,
      title: 'PTE',
      options: {aiAssist: {translateAction: true}},
    }),
    defineField({
      name: 'localeObject',
      type: localeObject.name,
      title: 'Localized object',
    }),
    defineField({
      name: 'featureProduct',
      type: 'internationalizedArrayFeatureProduct',
      title: 'Feature Product',
    }),
    defineField({
      type: 'image',
      name: 'image',
      title: 'Image',
      fields: [
        defineField({
          type: 'string',
          name: 'altText',
          title: 'Alt text',
        }),
      ],
      options: {
        aiAssist: {
          imageInstructionField: 'altText',
        },
      },
    }),
    defineField({
      type: 'array',
      name: 'alternateTitles',
      title: 'Alternate titles',
      of: [{type: 'string'}],
    }),
    defineField({
      type: recursiveObject.name,
      name: 'recursive',
    }),
    defineField({
      name: 'description',
      type: 'array',
      title: 'Description',
      of: [
        defineArrayMember({
          type: 'block',
          marks: {
            decorators: [
              {title: 'Bold', value: 'strong'},
              {title: 'Italic', value: 'em'},
            ] as any,
            annotations: [],
          },
          lists: [{value: 'bullet', title: 'Bullet'}],
          styles: [{value: 'normal', title: 'Normal'}],
        }),
      ],
    }),
    defineField({
      name: 'body',
      type: 'array',
      title: 'Body',
      of: [
        defineArrayMember({
          type: 'block',
          marks: {
            decorators: [
              {title: 'Bold', value: 'strong'},
              {title: 'Italic', value: 'em'},
            ] as any,
            annotations: [],
          },
        }),
        defineArrayMember({
          type: 'image',
          name: 'image',
          title: 'Image',
          fields: [
            defineField({
              type: 'string',
              name: 'altText',
              title: 'Alt text',
            }),
          ],
          options: {
            aiAssist: {
              imageInstructionField: 'altText',
            },
          },
        }),
        defineArrayMember({
          type: 'object',
          name: 'callout',
          title: 'Callout',
          icon: WarningOutlineIcon,
          preview: {
            select: {
              title: 'title',
            },
            prepare: ({title}) => {
              return {
                title,
                subtitle: 'Callout',
              }
            },
          },
          fields: [
            defineField({
              type: 'string',
              name: 'title',
              title: 'Title',
            }),
            defineField({
              type: 'array',
              name: 'body',
              title: 'Body',
              of: [
                defineArrayMember({
                  type: 'block',
                  marks: {
                    decorators: [
                      {title: 'Bold', value: 'strong'},
                      {title: 'Italic', value: 'em'},
                    ] as any,
                    annotations: [],
                  },
                  lists: [{value: 'bullet', title: 'Bullet'}],
                  styles: [{value: 'normal', title: 'Normal'}],
                }),
              ],
            }),
          ],
        }),
        defineArrayMember({
          type: 'object',
          name: 'quote',
          title: 'Quote',
          icon: BlockquoteIcon,
          preview: {
            select: {
              subtitle: 'source',
              title: 'text',
            },
          },
          fields: [
            defineField({
              type: 'string',
              name: 'source',
              title: 'Source',
            }),
            defineField({
              type: 'text',
              name: 'text',
              title: 'Text',
            }),
          ],
        }),
      ],
    }),
  ],
})

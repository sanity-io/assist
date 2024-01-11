import {defineArrayMember, defineField, defineType, PreviewProps} from 'sanity'
import {
  ActivityIcon,
  BlockquoteIcon,
  ClipboardIcon,
  ErrorOutlineIcon,
  ImageIcon,
  TagIcon,
  TrendUpwardIcon,
  WarningOutlineIcon,
} from '@sanity/icons'
import {Stack, Text} from '@sanity/ui'
import {dataset, projectId} from '../env'
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
    })
  ),
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
    })
  ),
})

export const languageArticle = defineType({
  type: 'document',
  name: 'languageArticle',
  title: 'Multi language',
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
      type: 'string',
      name: 'language',
      title: 'Language',
      options: {
        list: ['Norwegian', 'German', 'English (US)', 'Spanish']
          .map((v) => ({title: v, value: v}))
          .sort(),
      },
    }),
    defineField({
      name: 'subtitle',
      type: 'internationalizedArrayString',
      title: 'Subtitle',
    }),
    defineField({
      name: 'localePte',
      type: localizedPte.name,
      title: 'PTE',
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
      // featureProduct: [{_key: 'langId', title: string }]
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
        imagePromptField: 'altText',
      },
    }),
    defineField({
      type: 'array',
      name: 'alternateTitles',
      title: 'Alternate titles',
      of: [{type: 'string'}],
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
            imagePromptField: 'altText',
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

export const articleImage = defineType({
  type: 'image',
  name: 'articleImage',
  title: 'Image',
  icon: ImageIcon,
  fields: [
    defineField({
      type: 'string',
      name: 'altText',
      title: 'Alt text',
    }),
  ],
  options: {
    imagePromptField: 'altText',
    captionField: 'altText',
  },
})

export const excludedTypeString = defineType({
  type: 'string',
  name: 'excludedTypeString',
  title: 'Excluded string type',
  options: {
    aiWritingAssistance: {
      exclude: true,
    },
  },
})

export const factBox = defineType({
  type: 'object',
  name: 'factBox',
  title: 'Factbox',
  icon: ErrorOutlineIcon,
  fields: [
    defineField({
      type: 'string',
      name: 'title',
      title: 'Title',
    }),
    defineField({
      type: 'string',
      name: 'subtitle',
      title: 'Subtitle',
    }),
    defineField({
      type: 'text',
      name: 'facts',
      title: 'Facts',
    }),
    defineField({
      type: 'array',
      name: 'more',
      title: 'More facts',
      of: [{type: 'factBox'}],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'subtitle',
      facts: 'facts',
    },
    prepare: (select) => {
      return {
        ...select,
        media: ErrorOutlineIcon,
      }
    },
  },
})

export const todo = defineType({
  type: 'object',
  name: 'todo',
  title: 'Todo',
  icon: ClipboardIcon,
  fields: [
    defineField({
      type: 'array',
      name: 'items',
      title: 'Todo items',
      of: [{type: 'string'}],
    }),
  ],
  preview: {
    select: {
      items: 'items',
    },
    prepare: ({items = []}) => {
      return {
        title: `Todo (${items.length} items)`,
        items,
        media: ClipboardIcon,
      }
    },
  },
  components: {
    preview: (props: any) => {
      return (
        <Stack space={2} padding={2}>
          <Text weight="semibold">Article TODOs</Text>
          <ul>
            {props?.items?.map((todo: string) => (
              <li key={todo}>{todo}</li>
            ))}
          </ul>
        </Stack>
      )
    },
  },
})

export const timelineEvent = defineType({
  type: 'object',
  name: 'timelineEvent',
  title: 'Timeline event',
  icon: ActivityIcon,
  fields: [
    defineField({
      type: 'string',
      name: 'title',
      title: 'Title',
    }),
    defineField({
      type: 'string',
      name: 'periodDescription',
      title: 'Period description',
    }),
    defineField({
      type: 'text',
      name: 'eventDescription',
      title: 'Event description',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'periodDescription',
    },
  },
})

export const timeline = defineType({
  type: 'object',
  name: 'timeline',
  title: 'Timeline',
  icon: TrendUpwardIcon,
  fields: [
    defineField({
      type: 'array',
      name: 'events',
      title: 'Events',
      of: [defineArrayMember({type: timelineEvent.name})],
    }),
  ],
  preview: {
    select: {
      events: 'events',
    },
    prepare: ({events = []}) => {
      return {
        title: `Events (${events.length})`,
        events,
        media: TrendUpwardIcon,
      }
    },
  },
  components: {
    preview: (props: PreviewProps & {events?: any[]}) => {
      return (
        <Stack space={2} padding={2}>
          <Text weight="semibold">Timeline</Text>
          <ul>
            {props?.events?.map(
              (event: {_key: string; title: string; periodDescription: string}) => (
                <li key={event?._key}>
                  {event?.title ?? 'No title'} - {event?.periodDescription ?? 'No description'}
                </li>
              )
            )}
          </ul>
        </Stack>
      )
    },
  },
})

export const seoObject = defineType({
  type: 'object',
  name: 'seoObject',
  title: 'SEO',
  fields: [
    defineField({
      type: 'string',
      name: 'seoTitle',
      title: 'SEO title',
    }),
    defineField({
      type: 'text',
      name: 'seoDescription',
      title: 'SEO Description',
    }),
    defineField({
      type: 'array',
      name: 'seoKeywords',
      title: 'SEO Keywords',
      of: [{type: 'string'}],
    }),
  ],
  options: {
    collapsible: true,
  },
})

export const mockArticle = defineType({
  type: 'document',
  name: 'mockArticle',
  __experimental_formPreviewTitle: false,
  title: 'Article',
  fieldsets: [{name: 'group', title: 'SEO', options: {columns: 1}}],
  preview: {
    select: {
      title: 'title',
      subtitle: 'lede',
      lang: 'language',
    },
    prepare: ({title, subtitle, lang}) => {
      return {
        title,
        subtitle: `${lang ? languages.find((l) => l.id === lang)?.title ?? lang : subtitle ?? ''}`,
      }
    },
  },
  options: {
    aiWritingAssistance: {
      exclude: false,
    },
  },
  fields: [
    defineField({
      type: 'string',
      name: 'title',
      title: 'Title',
    }),
    /*    defineField({
      type: 'reference',
      name: 'ref',
      title: 'Article reference',
      to: [{type: 'mockArticle'}],
      options: {
        aiWritingAssistance: {
          embeddingsIndex: 'articles',
        },
      },
    }),*/
    defineField({
      type: 'array',
      name: 'categories',
      title: 'Categories',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'category'}],
          options: {
            aiWritingAssistance: {
              embeddingsIndex: 'Categories',
            },
          },
        }),
      ],
    }),
    defineField({
      type: 'array',
      name: 'refs',
      title: 'Article references',
      of: [
        defineField({
          type: 'reference',
          name: 'ref',
          title: 'Article reference',
          to: [{type: 'mockArticle'}],
          options: {
            aiWritingAssistance: {
              embeddingsIndex: 'articles',
            },
          },
        }),
      ],
    }),
    defineField({
      name: 'language',
      type: 'string',
      readOnly: true,
      hidden: true,
    }),

    defineField({
      type: 'excludedTypeString',
      name: 'excludedTypeString',
      title: 'Overridden Excluded type string',
      options: {
        aiWritingAssistance: {
          exclude: false,
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
      type: 'text',
      name: 'lede',
      title: 'Lede',
    }),
    defineField({
      type: articleImage.name,
      name: 'image',
      title: 'Cover image',
      options: {
        collapsible: true,
      },
    }),
    defineField({
      type: 'array',
      name: 'gallery',
      title: 'Gallery',
      of: [{type: articleImage.name}],
    }),
    defineField({
      name: 'body',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'block',
          of: [{type: todo.name}],
          marks: {
            decorators: [
              {title: 'Bold', value: 'strong'},
              {title: 'Italic', value: 'em'},
              {title: 'Code', value: 'code'},
            ] as any,
            annotations: [],
          },
        }),
        {type: articleImage.name},
        {type: 'code'},
        {type: timeline.name},
        {type: factBox.name},
        {type: todo.name},
        {
          type: 'object',
          name: 'detail',
          title: 'Detail',
          fields: [{name: 'title', title: 'Title', type: 'string'}],
        },
        defineArrayMember({
          type: 'reference',
          name: 'ref',
          title: 'Article reference',
          to: [{type: 'mockArticle'}],
          options: {
            aiWritingAssistance: {
              embeddingsIndex: 'articles',
            },
          },
        }),
      ],
    }),
    defineField({
      name: 'plainBody',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'block',
          marks: {
            decorators: [
              {title: 'Bold', value: 'strong'},
              {title: 'Italic', value: 'em'},
              {title: 'Code', value: 'code'},
            ] as any,
            annotations: [],
          },
        }),
      ],
    }),
    defineField({
      name: 'alternateTakes',
      type: 'array',
      title: 'Alternate takes',
      of: [defineArrayMember({type: factBox.name}), defineArrayMember({type: timeline.name})],
    }),
    defineField({
      type: factBox.name,
      name: 'heroFactbox',
      title: 'Hero factbox',
      options: {
        collapsible: true,
        collapsed: true,
      },
    }),
    defineField({
      name: 'topics',
      type: 'array',
      title: 'Topics',
      of: [{type: 'string'}],
    }),
    defineField({
      name: 'number',
      type: 'array',
      title: 'Numbers',
      of: [{type: 'number'}],
    }),
    defineField({
      type: 'crossDatasetReference',
      name: 'crossRef',
      title: 'Cross dataset ref',
      to: [{type: 'mockArticle', preview: {select: {title: 'title'}}}],
      projectId,
      dataset,
    }),
    defineField({
      type: seoObject.name,
      name: 'seo',
      title: 'SEO',
    }),
    defineField({
      type: 'object',
      name: 'inline',
      title: 'Inline object',
      fields: [
        defineField({
          type: 'string',
          name: 'title',
          title: 'Title',
        }),
      ],
    }),
    defineField({
      type: 'array',
      name: 'arrayWithInline',
      title: 'Inline item types',
      of: [
        defineArrayMember({
          type: 'object',
          title: 'A',
          fields: [
            defineField({
              type: 'string',
              name: 'title',
              title: 'Title',
            }),
          ],
        }),
        defineArrayMember({
          type: 'object',
          title: 'B',
          name: 'b',
          fields: [
            defineField({
              type: 'string',
              name: 'title',
              title: 'Title',
            }),
          ],
        }),
      ],
    }),
    defineField({
      type: 'image',
      name: 'inlineImage',
      title: 'Image (inline type)',
      fields: [
        defineField({
          type: 'object',
          name: 'wrapper',
          title: 'Wrapper',
          fields: [
            defineField({
              type: 'object',
              name: 'wrapper',
              title: 'Wrapper',
              fields: [
                defineField({
                  type: 'string',
                  name: 'caption',
                  title: 'Caption',
                }),
              ],
            }),
          ],
        }),
      ],
      options: {
        captionField: 'wrapper.wrapper.caption',
      },
    }),
    defineField({
      type: 'object',
      name: 'inlineObject',
      title: 'Inline object',
      fields: [
        defineField({
          type: 'string',
          name: 'readOnly',
          readOnly: true,
        }),
        defineField({
          type: 'string',
          name: 'hidden',
          hidden: true,
        }),
        defineField({
          type: 'string',
          name: 'Write',
        }),
      ],
    }),
    defineField({
      name: 'select',
      type: 'array',
      of: [{type: 'string'}],
      options: {
        list: [
          {
            title: 'Apple',
            value: 'apple',
          },
          {
            title: 'Orange',
            value: 'orange',
          },
          {
            title: 'Grape',
            value: 'grape',
          },
          {
            title: 'Rock',
            value: 'rock',
          },
        ],
      },
    }),
  ],
})

export const category = defineType({
  type: 'document',
  name: 'category',
  icon: TagIcon,
  fields: [
    defineField({
      type: 'string',
      name: 'title',
      title: 'Title',
    }),
  ],
})

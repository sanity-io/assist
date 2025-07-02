import {defineArrayMember, defineField, defineType, PreviewProps} from 'sanity'
import {
  ActivityIcon,
  ClipboardIcon,
  ErrorOutlineIcon,
  ImageIcon,
  TagIcon,
  TrendUpwardIcon,
} from '@sanity/icons'
import {Stack, Text} from '@sanity/ui'
import {dataset, projectId} from '../env'
import {languages} from '../src/lang/languages'

export const simplePte = defineType({
  name: 'simplePte',
  title: 'Rich text',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'block',
      styles: [{title: 'Normal', value: 'normal'}],
      marks: {
        decorators: [
          {title: 'Bold', value: 'strong'},
          {title: 'Italic', value: 'em'},
        ] as any,
        annotations: [],
      },
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
    defineField({
      type: 'text',
      name: 'imagePrompt',
      title: 'Image prompt',
      rows: 2,
    }),
  ],
  options: {
    aiAssist: {
      imageInstructionField: 'imagePrompt',
      imageDescriptionField: 'altText',
    },
  },
})

export const excludedTypeString = defineType({
  type: 'string',
  name: 'excludedTypeString',
  title: 'Excluded string type',
  options: {
    aiAssist: {
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
      if (props.layout === 'inline') {
        return <div>Article TODOs</div>
      }
      return (
        <Stack space={2} padding={2}>
          <Text weight="semibold">Article TODOs</Text>
          <ul>{props?.items?.map((todo: string) => <li key={todo}>{todo}</li>)}</ul>
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
              ),
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
      readOnly: () => false,
      hidden: () => false,
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
  //hidden: () => false,
  //readOnly: () => false,
  fieldsets: [
    {
      name: 'seo-fieldset',
      title: 'SEO',
      options: {columns: 1},
      readOnly: () => false,
      hidden: () => false,
    },
  ],
  groups: [{name: 'seo', title: 'SEO', hidden: () => false}],
  preview: {
    select: {
      title: 'title',
      subtitle: 'lede',
      lang: 'language',
      imageUrl: 'image.asset.url',
    },
    prepare: ({title, subtitle, lang, imageUrl}) => {
      return {
        title,
        subtitle: `${lang ? (languages.find((l) => l.id === lang)?.title ?? lang) : (subtitle ?? '')}`,
        media: imageUrl ? <img src={`${imageUrl}?w=100`} alt="" /> : undefined,
      }
    },
  },
  options: {
    aiAssist: {
      exclude: false,
    },
  },
  fields: [
    defineField({
      type: 'string',
      name: 'title',
      title: 'Title',
      hidden: () => false,
      readOnly: () => false,
      /*options: {
        aiAssist: {translateAction: true},
      },*/
    }),
    defineField({
      name: 'language',
      type: 'string',
      readOnly: false,
      hidden: false,
      options: {
        list: languages.map(({id, title}) => ({value: id, title})),
      },
    }),
    defineField({
      name: 'summary',
      type: 'text',
    }),
    /*    defineField({
      type: 'reference',
      name: 'ref',
      title: 'Article reference',
      to: [{type: 'mockArticle'}],
      options: {
        aiAssist: {
          embeddingsIndex: 'articles',
        },
      },
    }),*/
    /*    defineField({
      type: 'array',
      name: 'categories',
      title: 'Categories',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{type: 'category'}],
          options: {
            aiAssist: {
              embeddingsIndex: 'Categories',
            },
          },
        }),
      ],
    }),*/
    defineField({
      type: 'text',
      name: 'lede',
      title: 'Lede',
      rows: 3,
      options: {
        aiAssist: {translateAction: true},
      },
    }),
    defineField({
      name: 'editDay',
      title: 'Day of edit',
      type: 'date',
    }),
    defineField({
      name: 'publishDay',
      title: 'Publishing date',
      type: 'datetime',
    }),
    defineField({
      type: 'slug',
      name: 'slug',
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
      type: 'image',
      name: 'fieldlessImage',
      title: 'Just an image',
    }),
    defineField({
      type: 'reference',
      name: 'category',
      title: 'Category',
      to: [{type: 'category'}],
      options: {
        aiAssist: {
          embeddingsIndex: 'Categories',
        },
      },
    }),
    defineField({
      type: 'array',
      name: 'refs',
      title: 'Article references',
      of: [
        defineArrayMember({
          type: 'reference',
          title: 'Article reference',
          to: [{type: 'mockArticle'}],
          options: {
            aiAssist: {
              embeddingsIndex: 'articles',
            },
          },
        }),
      ],
    }),
    defineField({
      name: 'body',
      type: 'array',
      readOnly: () => false,
      options: {
        aiAssist: {translateAction: true},
      },
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
            annotations: [
              defineArrayMember({
                type: 'object',
                name: 'test-annotation',
                fields: [
                  defineField({
                    type: 'string',
                    name: 'fact',
                    title: 'Fact',
                  }),
                  defineField({
                    type: 'simplePte',
                    name: 'details',
                    title: 'Details',
                    hidden: ({parent}) => !parent?.fact,
                  }),
                ],
              }),
            ],
          },
        }),
        defineArrayMember({
          type: 'reference',
          title: 'Article reference',
          to: [{type: 'mockArticle'}],
          options: {
            aiAssist: {
              embeddingsIndex: 'articles',
            },
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
      ],
    }),
    defineField({
      type: 'array',
      name: 'alternateTitles',
      title: 'Alternate titles',
      of: [{type: 'string'}],
    }),
    defineField({
      type: 'array',
      name: 'gallery',
      title: 'Gallery',
      of: [{type: articleImage.name}],
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
      name: 'canPublush',
      type: 'boolean',
      title: 'Can publish',
    }),
    defineField({
      name: 'homepage',
      type: 'url',
      title: 'Homepage',
    }),
    defineField({
      name: 'boolean',
      type: 'array',
      title: 'Switches',
      of: [{type: 'boolean'}],
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
      fieldset: 'seo-fieldset',
      group: 'seo',
      readOnly: () => false,
      hidden: () => false,
    }),
    defineField({
      type: 'object',
      fieldset: 'seo-fieldset',
      group: 'seo',
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
        aiAssist: {
          imageDescriptionField: {
            path: 'wrapper.wrapper.caption',
            updateOnImageChange: false,
          },
        },
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

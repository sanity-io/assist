import {defineArrayMember, defineField, defineType, PreviewProps} from 'sanity'
import {ActivityIcon, ClipboardIcon, ErrorOutlineIcon, TrendUpwardIcon} from '@sanity/icons'
import {Stack, Text} from '@sanity/ui'
import {dataset, projectId} from '../env'

export const articleImage = defineType({
  type: 'image',
  name: 'articleImage',
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
    captionField: 'altText',
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
  title: 'Article',
  /*  components: {
    input: ForceSummarizationButton,
  },*/
  fieldsets: [{name: 'group', title: 'SEO', options: {columns: 1}}],
  /*  groups: [{name: 'seo', title: 'SEO'}],*/
  preview: {
    select: {
      title: 'title',
      subtitle: 'lede',
    },
  },
  fields: [
    defineField({
      type: 'string',
      name: 'title',
      title: 'Title',
      readOnly: true,
      validation: (rule) => rule.required().min(3),
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
      validation: (rule) => rule.required(),
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
      name: 'body',
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
      type: 'reference',
      name: 'ref',
      title: 'Ref',
      to: [{type: 'mockArticle'}],
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
          type: 'string',
          name: 'caption',
          title: 'Caption',
        }),
      ],
      options: {
        imagePromptField: 'caption',
        captionField: 'caption',
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
  ],
})

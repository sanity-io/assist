import {DocumentTextIcon, TokenIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

import {HideReferenceChangedBannerInput} from '../components/HideReferenceChangedBannerInput'
import {contextDocumentTypeName} from '../types'

export const contextDocumentSchema = defineType({
  type: 'document',
  name: contextDocumentTypeName,
  title: 'AI context',
  liveEdit: true,
  icon: TokenIcon,
  components: {
    input: HideReferenceChangedBannerInput,
  },
  fields: [
    defineField({
      type: 'string',
      name: 'title',
      title: 'Title',
    }),
    defineField({
      name: 'context',
      type: 'array',
      title: 'Context',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [{title: 'Normal', value: 'normal'}],
          lists: [],
          marks: {
            decorators: [],
            annotations: [],
          },
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      context: 'context',
    },
    prepare({title, context}) {
      const text = context
        ?.flatMap((block: any) => block?.children)
        .flatMap((child: any) => child?.text?.split(' '))
        .filter(Boolean)
      const words = text?.length ?? 0
      return {
        title,
        subtitle: `Words: ${words}`,
        media: DocumentTextIcon,
      }
    },
  },
})

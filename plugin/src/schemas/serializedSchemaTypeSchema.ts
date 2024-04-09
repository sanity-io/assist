import {CodeIcon, StarIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

import {assistSerializedFieldTypeName, assistSerializedTypeName} from '../types'

export const serializedSchemaField = defineType({
  type: 'object',
  name: assistSerializedFieldTypeName,
  title: 'Field',
  icon: CodeIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
    }),
    defineField({
      name: 'type',
      title: 'Type',
      type: 'string',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'type',
    },
    prepare: ({title, subtitle}) => {
      return {
        title,
        subtitle,
        media: CodeIcon,
      }
    },
  },
})

export const serializedSchemaType = defineType({
  name: assistSerializedTypeName,
  type: 'document',
  title: 'Meta schema',
  icon: StarIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
    }),
    defineField({
      name: 'type',
      title: 'Type',
      type: 'string',
    }),
    defineField({
      name: 'fields',
      type: 'array',
      of: [{type: serializedSchemaField.name}],
    }),
  ],
})

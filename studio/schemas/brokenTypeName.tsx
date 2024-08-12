import {defineType} from 'sanity'

export const brokenTypeName = defineType({
  type: 'document',
  name: 'broken/type%broken©™£€∞' /* this document type name will crash standard studio structures*/,
  fields: [
    {
      type: 'string',
      name: 'title',
    },
  ],
})

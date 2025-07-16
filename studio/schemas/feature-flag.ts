import {defineField, defineType} from 'sanity'

const fields = 50

const specs = Array.from({length: fields}, (_, i) => ({
  id: `id_${i}`,
  title: `Title ${i + 1}`,
}))

const generalFeatureFlags = {
  type: 'object',
  name: 'general',
  title: 'General features',
  fields: Array.from({length: fields}, (_, i) =>
    defineField({
      title: `General Feature ${i}`,
      description: 'Some description',
      name: `feature${i}`,
      type: 'boolean',
    }),
  ),
}

const getSpesificFeatureFlags = ({title, id}: any) => ({
  type: 'object',
  name: id,
  title,
  fields: Array.from({length: fields}, (_, i) =>
    defineField({
      title: `Specific Feature for "${title}" ${i}`,
      description: 'Some description',
      name: `specificFeature${i}`,
      type: 'boolean',
    }),
  ),
  group: id,
})

export const lotsOfFields = defineType({
  title: 'Lots of fields',
  name: 'lotsOfFields',
  type: 'document',
  groups: specs.map(({id, title}) => ({name: id, title})),
  fields: [generalFeatureFlags, ...specs.map((brand) => getSpesificFeatureFlags(brand))],
  preview: {
    prepare: () => ({title: 'Feature flag configuration'}),
  },
})

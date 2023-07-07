import {describe, expect, test} from 'vitest'
import {Schema} from '@sanity/schema'
import {serializeSchema} from './serializeSchema'
import {defineArrayMember, defineField, defineType} from 'sanity'
import {AssistOptions} from '../typeDefExtensions'

const mockStudioTypes = [
  defineField({
    type: 'object',
    name: 'slug',
    fields: [{type: 'string', name: '_ref'}],
  }),
  defineField({
    type: 'object',
    name: 'sanity.imageHotspot',
    fields: [{type: 'string', name: 'whatever'}],
  }),
  defineField({
    type: 'object',
    name: 'sanity.imageCrop',
    fields: [{type: 'string', name: 'whatever'}],
  }),
]

describe('serializeSchema', () => {
  test('should serialize simple schema', () => {
    const schema = Schema.compile({
      name: 'test',
      types: [
        {
          type: 'document',
          name: 'article',
          fields: [
            {type: 'string', name: 'title'},
            {type: 'some', name: 'some'},
            {
              name: 'array',
              of: [{type: 'some'}],
              type: 'array',
            },
          ],
        },
        {
          type: 'object',
          name: 'some',
          fields: [{type: 'string', name: 'title'}],
        },
      ],
    })

    const serializedTypes = serializeSchema(schema, {leanFormat: true})

    expect(serializedTypes).toEqual([
      {
        fields: [
          {name: 'title', title: 'Title', type: 'string'},
          {name: 'some', title: 'Some', type: 'some'},
          {
            name: 'array',
            of: [{name: 'some', title: 'Some', type: 'some'}],
            title: 'Array',
            type: 'array',
          },
        ],
        name: 'article',
        title: 'Article',
        type: 'document',
      },
      {
        fields: [{name: 'title', title: 'Title', type: 'string'}],
        name: 'some',
        title: 'Some',
        type: 'object',
      },
    ])
  })

  test('should not serialize slug type', () => {
    const schema = Schema.compile({
      name: 'test',
      types: mockStudioTypes,
    })

    const serializedTypes = serializeSchema(schema, {leanFormat: true})

    //everything excluded directly or indirectly
    expect(serializedTypes).toEqual([])
  })

  test('should not serialize excluded fields or types or types with every member excluded', () => {
    const options: AssistOptions = {aiWritingAssistance: {exclude: true}}

    const schema = Schema.compile({
      name: 'test',
      types: [
        {
          type: 'document',
          name: 'allFieldsExcluded',
          fields: [
            defineField({type: 'string', name: 'title', options}),
            defineField({
              type: 'object',
              name: 'excludedObject',
              // all fields excluded should exclude field
              fields: [{type: 'string', name: 'title', options}],
              options: {aiWritingAssistance: {exclude: true}},
            }),
            defineField({
              type: 'array',
              name: 'excludedArray',
              // all items excluded should exclude field
              of: [{type: 'object', name: 'remove', options}, {type: 'excluded'}],
              options: {aiWritingAssistance: {exclude: true}},
            }),
            //image without extra fields should be excluded
            defineField({type: 'image', name: 'image'}),
            // unsupported types
            defineField({type: 'number', name: 'number'}),
            defineField({type: 'slug', name: 'slug'}),
            defineField({type: 'url', name: 'url'}),
            defineField({type: 'datetime', name: 'datetime'}),
            defineField({type: 'file', name: 'file'}),
            defineField({type: 'reference', name: 'reference', to: [{type: 'excluded'}]}),
            defineField({
              type: 'crossDatasetReference',
              name: 'crossDatasetReference',
              to: [{type: 'excluded'}],
              dataset: 'x',
              projectId: 'y',
            }),
          ],
        },
        defineField({
          type: 'object',
          name: 'excluded',
          fields: [{type: 'string', name: 'title', options}],
          options: {aiWritingAssistance: {exclude: true}},
        }),
        ...mockStudioTypes,
      ],
    })

    const serializedTypes = serializeSchema(schema, {leanFormat: true})

    //everything excluded directly or indirectly
    expect(serializedTypes).toEqual([])
  })

  test('should serialize opt-in inline object using custom typeName', () => {
    const schema = Schema.compile({
      name: 'test',
      types: [
        {
          type: 'document',
          name: 'article',
          fields: [
            {type: 'string', name: 'title'},
            defineField({
              type: 'object',
              name: 'some',
              fields: [{type: 'string', name: 'title'}],
            }),
            defineField({
              type: 'array',
              name: 'array',
              of: [
                defineArrayMember({
                  type: 'object',
                  name: 'inlineArrayMember',
                  fields: [{type: 'string', name: 'title'}],
                }),
              ],
            }),
          ],
        },
      ],
    })

    const serializedTypes = serializeSchema(schema, {leanFormat: true})

    expect(serializedTypes).toEqual([
      {
        fields: [
          {name: 'title', title: 'Title', type: 'string'},
          {
            name: 'some',
            title: 'Some',
            type: 'object',
            fields: [{name: 'title', title: 'Title', type: 'string'}],
          },
          {
            name: 'array',
            of: [
              {
                type: 'object',
                name: 'inlineArrayMember',
                title: 'Inline Array Member',
                fields: [{name: 'title', title: 'Title', type: 'string'}],
              },
            ],
            title: 'Array',
            type: 'array',
          },
        ],
        name: 'article',
        title: 'Article',
        type: 'document',
      },
    ])
  })

  test('should serialize inline object', () => {
    const schema = Schema.compile({
      name: 'test',
      types: [
        {
          type: 'document',
          name: 'article',
          fields: [
            {type: 'string', name: 'title'},
            defineField({
              type: 'object',
              name: 'someObject',
              fields: [{type: 'string', name: 'title'}],
            }),
            defineField({
              type: 'file',
              name: 'someFile',
              fields: [{type: 'string', name: 'title'}],
            }),
            defineField({
              type: 'image',
              name: 'someImage',
              fields: [{type: 'string', name: 'title'}],
            }),
          ],
        },
        ...mockStudioTypes,
      ],
    })

    const serializedTypes = serializeSchema(schema, {leanFormat: true})

    expect(serializedTypes).toEqual([
      {
        fields: [
          {name: 'title', title: 'Title', type: 'string'},
          {
            name: 'someObject',
            title: 'Some Object',
            type: 'object',
            fields: [{name: 'title', title: 'Title', type: 'string'}],
          },
          {
            name: 'someImage',
            title: 'Some Image',
            type: 'image',
            fields: [{name: 'title', title: 'Title', type: 'string'}],
          },
        ],
        name: 'article',
        title: 'Article',
        type: 'document',
      },
    ])
  })

  test('should serialize inline, anonymous array object type', () => {
    const schema = Schema.compile({
      name: 'test',
      types: [
        {
          type: 'document',
          name: 'article',
          fields: [
            {type: 'string', name: 'title'},
            defineField({
              type: 'array',
              name: 'array',
              of: [
                defineArrayMember({
                  type: 'object',
                  title: 'Nameless item',
                  fields: [{type: 'string', name: 'title'}],
                }),
              ],
            }),
          ],
        },
        {
          fields: [{name: 'title', title: 'Title', type: 'string'}],
          name: 'item',
          title: 'Item',
          type: 'object',
        },
      ],
    })

    const serializedTypes = serializeSchema(schema, {leanFormat: true})

    expect(serializedTypes).toEqual([
      {
        fields: [
          {name: 'title', title: 'Title', type: 'string'},
          {
            name: 'array',
            of: [
              {
                name: 'object',
                title: 'Nameless item',
                type: 'object',
                fields: [{name: 'title', title: 'Title', type: 'string'}],
              },
            ],
            title: 'Array',
            type: 'array',
          },
        ],
        name: 'article',
        title: 'Article',
        type: 'document',
      },
      {
        fields: [{name: 'title', title: 'Title', type: 'string'}],
        name: 'item',
        title: 'Item',
        type: 'object',
      },
    ])
  })

  test('should serialize nested inline objects', () => {
    const schema = Schema.compile({
      name: 'test',
      types: [
        {
          type: 'document',
          name: 'article',
          fields: [
            defineField({
              type: 'object',
              name: 'outer',
              fields: [
                defineField({
                  type: 'object',
                  name: 'inner',
                  fields: [{type: 'string', name: 'title'}],
                }),
              ],
            }),
          ],
        },
      ],
    })

    const serializedTypes = serializeSchema(schema, {leanFormat: true})

    expect(serializedTypes).toEqual([
      {
        name: 'article',
        title: 'Article',
        type: 'document',
        fields: [
          {
            fields: [
              {
                type: 'object',
                name: 'inner',
                title: 'Inner',
                fields: [{name: 'title', title: 'Title', type: 'string'}],
              },
            ],
            type: 'object',
            name: 'outer',
            title: 'Outer',
          },
        ],
      },
    ])
  })

  test('should serialize list values', () => {
    const schema = Schema.compile({
      name: 'test',
      types: [defineType({type: 'string', name: 'list', options: {list: ['a', 'b']}})],
    })

    const serializedTypes = serializeSchema(schema, {leanFormat: true})

    expect(serializedTypes).toEqual([
      {name: 'list', title: 'String', type: 'string', values: ['a', 'b']},
    ])
  })

  test('should exclude truthy hidden and readonly', () => {
    const schema = Schema.compile({
      name: 'test',
      types: [
        {
          type: 'document',
          name: 'article',
          fields: [
            {type: 'string', name: 'title', hidden: () => true},
            {type: 'some', name: 'some'},
          ],
        },
        defineType({
          type: 'object',
          name: 'some',
          readOnly: true,
          fields: [{type: 'string', name: 'title'}],
        }),
      ],
    })

    const serializedTypes = serializeSchema(schema, {leanFormat: true})

    expect(serializedTypes).toEqual([])
  })
})

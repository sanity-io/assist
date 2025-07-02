import {Schema} from '@sanity/schema'
import {defineArrayMember, defineField, defineType} from 'sanity'
import {describe, expect, test} from 'vitest'

import {AssistOptions} from '../typeDefExtensions'
import {serializeSchema} from './serializeSchema'

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
  test('should serialize excluded document schema to support exclude: false overrides at the field level', () => {
    const schema = Schema.compile({
      name: 'test',
      types: [
        defineType({
          type: 'document',
          name: 'article',
          fields: [{type: 'string', name: 'title'}],
          options: {
            aiAssist: {
              exclude: true,
            },
          },
        }),
      ],
    })

    const serializedTypes = serializeSchema(schema, {leanFormat: true})

    expect(serializedTypes).toEqual([
      {
        fields: [
          {
            name: 'title',
            title: 'Title',
            type: 'string',
          },
        ],
        name: 'article',
        title: 'Article',
        type: 'document',
      },
    ])
  })

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

  test('should not serialize excluded fields or types or types with every member excluded (except images)', () => {
    const options: AssistOptions = {aiAssist: {exclude: true}}

    const schema = Schema.compile({
      name: 'test',
      types: [
        {
          type: 'document',
          name: 'mostFieldsExcluded',
          fields: [
            defineField({type: 'string', name: 'title', options}),
            defineField({
              type: 'object',
              name: 'excludedObject',
              // all fields excluded should exclude field
              fields: [{type: 'string', name: 'title', options}],
              options: {aiAssist: {exclude: true}},
            }),
            defineField({
              type: 'array',
              name: 'excludedArray',
              // all items excluded should exclude field
              of: [{type: 'object', name: 'remove', options}, {type: 'excluded'}],
              options: {aiAssist: {exclude: true}},
            }),
            //image without extra fields should NOT be excluded
            defineField({type: 'image', name: 'image'}),
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
          options: {aiAssist: {exclude: true}},
        }),
        ...mockStudioTypes,
      ],
    })

    const serializedTypes = serializeSchema(schema, {leanFormat: true})

    //everything excluded directly or indirectly
    expect(serializedTypes).toEqual([
      {
        fields: [
          {
            fields: [],
            name: 'image',
            title: 'Image',
            type: 'image',
          },
        ],
        name: 'mostFieldsExcluded',
        title: 'Most Fields Excluded',
        type: 'document',
      },
    ])
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

  test('should serialize list values in string array', () => {
    const schema = Schema.compile({
      name: 'test',
      types: [
        defineType({
          type: 'array',
          name: 'list',
          of: [{type: 'string'}],
          options: {
            list: [
              {title: 'A', value: 'a'},
              {title: 'B', value: 'b'},
            ],
          },
        }),
      ],
    })

    const serializedTypes = serializeSchema(schema, {leanFormat: true})

    expect(serializedTypes).toEqual([
      {
        name: 'list',
        type: 'array',
        of: [{type: 'string', name: 'string', title: 'String'}],
        values: ['a', 'b'],
      },
    ])
  })

  test('should not try to serialize list values if list values are not an array', () => {
    const schema = Schema.compile({
      name: 'test',
      types: [
        defineType({
          type: 'array',
          name: 'list',
          of: [{type: 'string'}],
          options: {
            list: new Promise(() => {}) as any, // Type usually only accepts array, but some plugins might use other types
          },
        }),
      ],
    })

    const serializedTypes = serializeSchema(schema, {leanFormat: true})

    expect(serializedTypes).toEqual([
      {
        name: 'list',
        type: 'array',
        of: [{type: 'string', name: 'string', title: 'String'}],
        values: undefined,
      },
    ])
  })

  test('should annotate truthy readonly', () => {
    const schema = Schema.compile({
      name: 'test',
      types: [
        {
          type: 'document',
          name: 'article',
          fields: [
            {type: 'string', name: 'title', readOnly: () => true},
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

    expect(serializedTypes).toEqual([
      {
        name: 'article',
        title: 'Article',
        type: 'document',
        fields: [
          {name: 'title', readOnly: 'function', title: 'Title', type: 'string'},
          {name: 'some', readOnly: true, title: 'Some', type: 'some'},
        ],
      },
      {
        name: 'some',
        readOnly: true,
        title: 'Some',
        type: 'object',
        fields: [{name: 'title', title: 'Title', type: 'string'}],
      },
    ])
  })

  test('should annotate truthy hidden', () => {
    const schema = Schema.compile({
      name: 'test',
      types: [
        {
          type: 'document',
          name: 'article',
          fields: [
            {type: 'string', name: 'title', hidden: true},
            {type: 'some', name: 'some'},
          ],
        },
        defineType({
          type: 'object',
          name: 'some',
          hidden: () => true,
          fields: [{type: 'string', name: 'title'}],
        }),
      ],
    })

    const serializedTypes = serializeSchema(schema, {leanFormat: true})

    expect(serializedTypes).toEqual([
      {
        name: 'article',
        title: 'Article',
        type: 'document',
        fields: [
          {hidden: true, name: 'title', title: 'Title', type: 'string'},
          {hidden: 'function', name: 'some', title: 'Some', type: 'some'},
        ],
      },
      {
        hidden: 'function',
        name: 'some',
        title: 'Some',
        type: 'object',
        fields: [{name: 'title', title: 'Title', type: 'string'}],
      },
    ])
  })

  test('should serialize annotations', () => {
    const schema = Schema.compile({
      name: 'test',
      types: [
        defineType({
          type: 'object',
          name: 'annotation',
          fields: [defineField({type: 'string', name: 'fact', title: 'Fact'})],
        }),
        defineType({
          name: 'blockAlias',
          type: 'block',
          marks: {annotations: [{type: 'annotation'}]},
        }),
        defineType({
          type: 'document',
          name: 'article',
          fields: [
            {
              type: 'array',
              name: 'inlinePte',
              of: [
                defineArrayMember({
                  type: 'block',
                  marks: {
                    annotations: [
                      defineArrayMember({
                        type: 'object',
                        name: 'inline-annotation',
                        fields: [defineField({type: 'string', name: 'fact', title: 'Fact'})],
                      }),
                    ],
                  },
                }),
              ],
            },
            {type: 'array', name: 'pte', of: [{type: 'blockAlias'}]},
          ],
        }),
      ],
    })

    const serializedTypes = serializeSchema(schema, {leanFormat: true})

    expect(serializedTypes).toEqual([
      {
        name: 'annotation',
        title: 'Annotation',
        type: 'object',
        fields: [{name: 'fact', title: 'Fact', type: 'string'}],
      },
      {
        name: 'article',
        title: 'Article',
        type: 'document',
        fields: [
          {
            name: 'inlinePte',
            title: 'Inline Pte',
            type: 'array',
            of: [
              {
                name: 'block',
                title: 'Block',
                type: 'block',
                inlineOf: [],
                annotations: [
                  {
                    name: 'inline-annotation',
                    title: 'Inline Annotation',
                    type: 'object',
                    fields: [{name: 'fact', title: 'Fact', type: 'string'}],
                  },
                ],
              },
            ],
          },
          {
            name: 'pte',
            of: [{name: 'blockAlias', title: 'Block', type: 'blockAlias'}],
            title: 'Pte',
            type: 'array',
          },
        ],
      },
      {
        name: 'blockAlias',
        title: 'Block',
        type: 'block',
        annotations: [{name: 'annotation', title: 'Annotation', type: 'annotation'}],
        inlineOf: [],
      },
    ])
  })

  test('should serialize inline block types', () => {
    const schema = Schema.compile({
      name: 'test',
      types: [
        defineType({
          type: 'object',
          name: 'inline-block',
          fields: [
            defineField({type: 'string', name: 'fact', title: 'Fact'}),
            defineField({type: 'blockAlias', name: 'recurse', title: 'Recursive'}),
          ],
        }),
        defineType({
          name: 'blockAlias',
          type: 'block',
          of: [{type: 'inline-block'}],
        }),
        defineType({
          type: 'document',
          name: 'article',
          fields: [{type: 'array', name: 'pte', of: [{type: 'blockAlias'}]}],
        }),
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
            name: 'pte',
            of: [
              {
                name: 'blockAlias',
                title: 'Block',
                type: 'blockAlias',
              },
            ],
            title: 'Pte',
            type: 'array',
          },
        ],
      },
      {
        name: 'blockAlias',
        title: 'Block',
        type: 'block',
        annotations: [
          {
            fields: [{name: 'href', title: 'Link', type: 'url'}],
            name: 'link',
            title: 'Link',
            type: 'object',
          },
        ],
        inlineOf: [
          {
            name: 'inline-block',
            title: 'Inline Block',
            type: 'inline-block',
          },
        ],
      },
      {
        name: 'inline-block',
        title: 'Inline Block',
        type: 'object',
        fields: [
          {name: 'fact', title: 'Fact', type: 'string'},
          {
            name: 'recurse',
            title: 'Recursive',
            type: 'blockAlias',
          },
        ],
      },
    ])
  })

  test('should no serialize global document reference types (for now)', () => {
    const schema = Schema.compile({
      name: 'test',
      types: [
        defineType({
          type: 'object',
          name: 'author',
          fields: [
            defineField({
              type: 'string',
              name: 'name',
            }),
            defineField({
              type: 'globalDocumentReference',
              name: 'person',
              title: 'Person',
              resourceType: 'dataset',
              resourceId: 'exx11uqh.blog',
              to: [
                {
                  type: 'person',
                  preview: {
                    select: {
                      title: 'title',
                      media: 'coverImage',
                    },
                    prepare(val: any) {
                      return {
                        title: val.title,
                        media: val.coverImage,
                      }
                    },
                  },
                },
              ],
            }),
          ],
        }),
      ],
    })

    const serializedTypes = serializeSchema(schema, {leanFormat: true})

    expect(serializedTypes).toEqual([
      {
        fields: [
          {
            name: 'name',
            title: 'Name',
            type: 'string',
          },
        ],
        name: 'author',
        title: 'Author',
        type: 'object',
      },
    ])
  })
})

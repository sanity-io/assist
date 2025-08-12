import {Schema} from '@sanity/schema'
import {ArraySchemaType, defineField, defineType, ObjectSchemaType} from 'sanity'
import {describe, expect, test} from 'vitest'

import {getConditionalMembers} from './conditionalMembers'

describe('conditionalMembers', () => {
  test('should not include paths without conditional hidden/readonly', () => {
    const docSchema: ObjectSchemaType = Schema.compile({
      name: 'test',
      types: [
        defineType({
          type: 'document',
          name: 'article',
          fields: [{type: 'string', name: 'title'}],
        }),
      ],
    }).get('article')

    const docState = {
      path: [],
      schemaType: docSchema,
      members: [
        {
          kind: 'field',
          field: {path: [docSchema.fields[0].name], schemaType: docSchema.fields[0].type},
        },
      ],
    } as any
    const conditionalMembers = getConditionalMembers(docState)

    expect(conditionalMembers).toEqual([])
  })

  test('should include path with conditional readonly', () => {
    const docSchema: ObjectSchemaType = Schema.compile({
      name: 'test',
      types: [
        defineType({
          type: 'document',
          name: 'article',
          fields: [{type: 'string', name: 'title', readOnly: () => false}],
        }),
      ],
    }).get('article')

    const docState = {
      path: [],
      schemaType: docSchema,
      members: [
        {
          kind: 'field',
          field: {path: [docSchema.fields[0].name], schemaType: docSchema.fields[0].type},
        },
      ],
    } as any
    const conditionalMembers = getConditionalMembers(docState)

    expect(conditionalMembers).toEqual([{path: 'title', hidden: false, readOnly: false}])
  })

  test('regression test: should include document path with conditional readonly and no hidden', () => {
    const docSchema: ObjectSchemaType = Schema.compile({
      name: 'test',
      types: [
        defineType({
          type: 'document',
          name: 'article',
          readOnly: () => false,
          fields: [{type: 'string', name: 'title'}],
        }),
      ],
    }).get('article')

    const docState = {
      path: [],
      schemaType: docSchema,
      members: [
        {
          kind: 'field',
          field: {path: [docSchema.fields[0].name], schemaType: docSchema.fields[0].type},
        },
      ],
    } as any
    const conditionalMembers = getConditionalMembers(docState)

    expect(conditionalMembers).toEqual([{path: '', hidden: false, readOnly: false}])
  })

  test('should include array item path with conditional readonly', () => {
    const docSchema: ObjectSchemaType = Schema.compile({
      name: 'test',
      types: [
        defineType({
          type: 'document',
          name: 'article',
          fields: [{type: 'array', name: 'array', of: [{type: 'string', readOnly: () => true}]}],
        }),
      ],
    }).get('article')

    const docState = {
      path: [],
      schemaType: docSchema,
      members: [
        {
          kind: 'field',
          field: {
            path: [docSchema.fields[0].name],
            schemaType: docSchema.fields[0].type,
            members: [
              {
                kind: 'item',
                item: {
                  path: [docSchema.fields[0].name, 0],
                  schemaType: (docSchema.fields[0].type as ArraySchemaType).of[0],
                  readOnly: true,
                },
              },
            ],
          },
        },
      ],
    } as any
    const conditionalMembers = getConditionalMembers(docState)

    expect(conditionalMembers).toEqual([
      {
        path: 'array[0]',
        hidden: false,
        readOnly: true,
      },
    ])
  })

  test('should include object path with conditional hidden', () => {
    const docSchema: ObjectSchemaType = Schema.compile({
      name: 'test',
      types: [
        defineType({
          type: 'document',
          name: 'article',
          fields: [
            defineField({
              type: 'object',
              name: 'object',
              fields: [{type: 'string', name: 'title', hidden: () => false}],
            }),
          ],
        }),
      ],
    }).get('article')

    const docState = {
      path: [],
      schemaType: docSchema,
      members: [
        {
          kind: 'field',
          field: {
            path: [docSchema.fields[0].name],
            schemaType: docSchema.fields[0].type,
            members: [
              {
                kind: 'field',
                field: {
                  path: [docSchema.fields[0].name, 'title'],
                  schemaType: (docSchema.fields[0].type as ObjectSchemaType).fields[0].type,
                },
              },
            ],
          },
        },
      ],
    } as any
    const conditionalMembers = getConditionalMembers(docState)

    expect(conditionalMembers).toEqual([
      {
        path: 'object.title',
        hidden: false,
        readOnly: false,
      },
    ])
  })

  test('should include path with fieldset with conditional state', () => {
    const docSchema: ObjectSchemaType = Schema.compile({
      name: 'test',
      types: [
        defineType({
          type: 'document',
          name: 'article',
          fieldsets: [{name: 'set', hidden: () => false}],
          fields: [{type: 'string', fieldset: 'set', name: 'title'}],
        }),
      ],
    }).get('article')

    const docState = {
      path: [],
      schemaType: docSchema,
      members: [
        {
          kind: 'fieldSet',
          fieldSet: {
            name: 'set',
            path: ['set'],
            members: [
              {
                kind: 'field',
                field: {path: [docSchema.fields[0].name], schemaType: docSchema.fields[0].type},
              },
            ],
          },
        },
      ],
    } as any
    const conditionalMembers = getConditionalMembers(docState)

    expect(conditionalMembers).toEqual([
      {
        path: 'title',
        hidden: false,
        readOnly: false,
      },
    ])
  })

  test('should include field with conditional state inside fieldset', () => {
    const docSchema: ObjectSchemaType = Schema.compile({
      name: 'test',
      types: [
        defineType({
          type: 'document',
          name: 'article',
          fieldsets: [{name: 'set'}],
          fields: [{type: 'string', fieldset: 'set', name: 'title', hidden: () => false}],
        }),
      ],
    }).get('article')

    const docState = {
      path: [],
      schemaType: docSchema,
      members: [
        {
          kind: 'fieldSet',
          fieldSet: {
            name: 'set',
            path: ['set'],
            members: [
              {
                kind: 'field',
                field: {path: [docSchema.fields[0].name], schemaType: docSchema.fields[0].type},
              },
            ],
          },
        },
      ],
    } as any
    const conditionalMembers = getConditionalMembers(docState)

    expect(conditionalMembers).toEqual([
      {
        path: 'title',
        hidden: false,
        readOnly: false,
      },
    ])
  })

  test('should respect max-depth', () => {
    const docSchema: ObjectSchemaType = Schema.compile({
      name: 'test',
      types: [
        defineType({
          type: 'document',
          name: 'article',
          fields: [
            {type: 'string', name: 'title', readOnly: () => false},
            {
              type: 'object',
              name: 'object',
              fields: [{type: 'string', name: 'title', readOnly: () => false}],
            },
          ],
        }),
      ],
    }).get('article')

    const docState = {
      path: [],
      schemaType: docSchema,
      members: [
        {
          kind: 'field',
          field: {path: [docSchema.fields[0].name], schemaType: docSchema.fields[0].type},
        },
        {
          kind: 'field',
          field: {
            path: [docSchema.fields[1].name],
            schemaType: docSchema.fields[1].type,
            members: [
              {
                kind: 'field',
                field: {path: ['object', 'title'], schemaType: docSchema.fields[0].type},
              },
            ],
          },
        },
      ],
    } as any
    const conditionalMembers = getConditionalMembers(docState, 1)

    expect(conditionalMembers).toEqual([{path: 'title', hidden: false, readOnly: false}])
  })
})

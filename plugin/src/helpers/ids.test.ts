import {describe, expect, test} from 'vitest'

import {assistDocumentId, assistTasksStatusId} from './ids'

describe('ids', () => {
  test('assistDocumentId should replace illegal id chars with _', () => {
    const testCases = [
      {schemaType: 'test', assistId: 'sanity.assist.schemaType.test'},
      {schemaType: 'test-type', assistId: 'sanity.assist.schemaType.test-type'},
      {schemaType: 'test/type', assistId: 'sanity.assist.schemaType.test_type'},
      {schemaType: '%broken©™£€∞', assistId: 'sanity.assist.schemaType._broken_____'},
    ]
    const outputs = testCases.map((testCase) => assistDocumentId(testCase.schemaType))
    const expected = testCases.map((testCase) => testCase.assistId)
    expect(outputs).toEqual(expected)
  })

  test.each([
    {documentId: 'foo', assistId: 'sanity.assist.status.foo'},
    {documentId: 'drafts.foo', assistId: 'sanity.assist.status.foo'},
    {documentId: 'versions.r12332.foo', assistId: 'sanity.assist.status.r12332.foo'},
  ])(
    "assistTasksStatusId should return the documentId with 'sanity.assist.status' prefix for $documentId",
    ({documentId, assistId}) => {
      expect(assistTasksStatusId(documentId)).toEqual(assistId)
    },
  )
})

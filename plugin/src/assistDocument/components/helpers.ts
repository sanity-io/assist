import {FieldError, FieldMember, FieldSetMember, ObjectMember} from 'sanity'

export function findFieldMember(
  members: ObjectMember[],
  fieldName: string,
): FieldMember | FieldError | undefined {
  return members.find(
    (m): m is FieldMember | FieldError =>
      (m.kind === 'field' && m.name === fieldName) ||
      (m.kind === 'error' && m.fieldName === fieldName),
  )
}

export function findFieldsetMember(
  members: ObjectMember[],
  fieldsetName: string,
): FieldSetMember | undefined {
  return members.find(
    (m): m is FieldSetMember => m.kind === 'fieldSet' && m.fieldSet.name === fieldsetName,
  )
}

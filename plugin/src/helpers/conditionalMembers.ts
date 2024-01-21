/* eslint-disable max-depth */
import {
  ArrayOfObjectsFormNode,
  ArrayOfObjectsItemMember,
  ArrayOfPrimitivesFormNode,
  DocumentFormNode,
  FieldsetState,
  isObjectSchemaType,
  ObjectFormNode,
  Path,
  pathToString,
  SchemaType,
} from 'sanity'

const MAX_DEPTH = 8

export interface ConditionalMemberState {
  path: string
  hidden: boolean
  readOnly: boolean
}

interface ConditionalMemberInnerState extends ConditionalMemberState {
  conditional: boolean
}

/**
 * This is used to statically determine the state of the functions on the server-side.
 * Paths which has a schema with conditional config should be considered hidden: true and/or readOnly: true
 * Only conditional paths are included, as static props can be determined from schema.
 *
 * Returns paths that has conditional hidden or readOnly schema config (function) and that.
 * Form-state does not contain hidden members.
 *
 * Note:
 * * If a parent path is hidden, no child paths are included
 * * If a parent path is readOnly, no child paths are included
 * * If a path is hidden, it is not included; only conditionally visible paths will be returned, with hidden: false
 */
export function getConditionalMembers(docState: DocumentFormNode): ConditionalMemberState[] {
  const doc: ConditionalMemberInnerState = {
    path: '',
    hidden: false,
    readOnly: !!docState.readOnly,
    conditional: typeof docState.schemaType.hidden === 'function',
  }
  return [doc, ...extractConditionalPaths(docState, MAX_DEPTH)]
    .filter((v) => v.conditional)
    .map(({conditional, ...state}) => ({...state}))
}

function isConditional(schemaType: SchemaType) {
  return typeof schemaType.hidden === 'function' || typeof schemaType.readOnly === 'function'
}

function conditionalState(memberState: {
  path: Path
  schemaType: SchemaType
  readOnly?: boolean
}): ConditionalMemberInnerState {
  return {
    path: pathToString(memberState.path),
    readOnly: !!memberState.readOnly,
    hidden: false, // if its in members, its not hidden
    conditional: isConditional(memberState.schemaType),
  }
}

function extractConditionalPaths(
  node: ObjectFormNode | FieldsetState,
  maxDepth: number
): ConditionalMemberInnerState[] {
  if (node.path.length >= maxDepth) {
    return []
  }

  return node.members.reduce<ConditionalMemberInnerState[]>((acc, member) => {
    if (member.kind === 'error') {
      return acc
    }
    if (member.kind === 'field') {
      const schemaType = member.field.schemaType
      if (schemaType.jsonType === 'object') {
        const innerFields = member.field.readOnly
          ? []
          : extractConditionalPaths(member.field as ObjectFormNode, maxDepth)
        return [...acc, conditionalState(member.field), ...innerFields]
      } else if (schemaType.jsonType === 'array') {
        const array = member.field as ArrayOfObjectsFormNode | ArrayOfPrimitivesFormNode

        let arrayPaths: ConditionalMemberInnerState[] = []
        const isObjectsArray = array.members.some(
          (m) => m.kind === 'item' && isObjectSchemaType(m.item.schemaType)
        )
        if (!array.readOnly) {
          for (const arrayMember of array.members) {
            if (arrayMember.kind === 'error') {
              continue
            }

            const innerFields =
              isObjectsArray && !arrayMember.item.readOnly
                ? extractConditionalPaths((arrayMember as ArrayOfObjectsItemMember).item, maxDepth)
                : []

            arrayPaths = [...arrayPaths, conditionalState(arrayMember.item), ...innerFields]
          }
        }
        return [...acc, conditionalState(array), ...arrayPaths]
      }

      return [...acc, conditionalState(member.field)]
    } else if (member.kind === 'fieldSet') {
      const conditionalFieldset = !!(node as ObjectFormNode).schemaType?.fieldsets?.some(
        (f) => !f.single && f.name === member.fieldSet.name && typeof f.hidden === 'function'
      )
      const innerFields = extractConditionalPaths(member.fieldSet, maxDepth).map((f) => ({
        ...f,
        // if fieldset is conditional, visible fields must also be considered conditional
        conditional: conditionalFieldset ?? f.conditional,
      }))
      return [...acc, ...innerFields]
    }

    return acc
  }, [])
}

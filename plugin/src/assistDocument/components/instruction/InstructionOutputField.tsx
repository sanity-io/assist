import {useCallback, useContext, useState} from 'react'
import {
  ArrayFieldProps,
  ArraySchemaType,
  isArrayOfObjectsSchemaType,
  isObjectSchemaType,
  ObjectSchemaType,
} from 'sanity'

import {SelectedFieldContext} from '../SelectedFieldContext'

export function InstructionOutputField(props: ArrayFieldProps) {
  const {fieldSchema} = useContext(SelectedFieldContext) ?? {}

  if (
    !fieldSchema ||
    !(isObjectSchemaType(fieldSchema) || isArrayOfObjectsSchemaType(fieldSchema))
  ) {
    return null
  }

  return (
    <EnabledOutputField {...props} fieldSchema={fieldSchema}>
      {props.children}
    </EnabledOutputField>
  )
}

function EnabledOutputField({
  fieldSchema,
  ...props
}: ArrayFieldProps & {fieldSchema: ObjectSchemaType | ArraySchemaType<ObjectSchemaType>}) {
  const [open, setOpen] = useState(!!props.value?.length)
  const onExpand = useCallback(() => setOpen(true), [])
  const onCollapse = useCallback(() => setOpen(false), [])

  return props.renderDefault({
    ...props,
    collapsible: true,
    onExpand,
    onCollapse,
    collapsed: !open,
    level: 1,
    title: isObjectSchemaType(fieldSchema) ? 'Allowed fields' : 'Allowed types',
  })
}

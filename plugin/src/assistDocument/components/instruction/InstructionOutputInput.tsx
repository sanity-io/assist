import {Card, Checkbox, Flex, Stack, Text} from '@sanity/ui'
import {useCallback, useContext, useEffect, useMemo} from 'react'
import {
  ArrayOfObjectsInputProps,
  ArraySchemaType,
  FormPatch,
  insert,
  isArrayOfObjectsSchemaType,
  isObjectSchemaType,
  ObjectSchemaType,
  PatchEvent,
  setIfMissing,
  typed,
  unset,
} from 'sanity'

import {isAssistSupported} from '../../../helpers/assistSupported'
import {isType} from '../../../helpers/typeUtils'
import {OutputFieldItem, outputFieldTypeName, OutputTypeItem} from '../../../types'
import {SelectedFieldContext} from '../SelectedFieldContext'

export function InstructionOutputInput(props: ArrayOfObjectsInputProps) {
  const {fieldSchema} = useContext(SelectedFieldContext) ?? {}

  if (!fieldSchema) {
    return null
  }

  if (isObjectSchemaType(fieldSchema)) {
    return <ObjectOutputInput {...props} fieldSchema={fieldSchema} />
  }

  if (isArrayOfObjectsSchemaType(fieldSchema)) {
    return <ArrayOutputInput {...props} fieldSchema={fieldSchema} />
  }
  return null
}

function useEmptySelectAllValue(
  value: (OutputTypeItem | OutputFieldItem)[],
  allowedValues: {name: string}[],
  onChange: (patch: FormPatch | FormPatch[] | PatchEvent) => void,
) {
  useEffect(() => {
    const validValues = value?.filter((v) =>
      allowedValues.find(
        (f) => f.name === (v._type === outputFieldTypeName ? v.relativePath : v.type),
      ),
    )
    const valueLength = value?.length ?? 0
    const validLength = validValues?.length ?? 0
    if ((!validLength && valueLength) || validLength >= allowedValues.length) {
      // if we end up here, we consider this a "no selected fields/types" selections. This should render and behave as all values selected.
      // we need this behaviour to accommodate new fields/types being added to the model, so they get visited by instructions without having to update the filter
      // when things have been explicitly selected, we let the selection remain as is
      onChange(PatchEvent.from([unset()]))
    }
  }, [allowedValues, value, onChange])
}

function ObjectOutputInput({
  fieldSchema,
  ...props
}: ArrayOfObjectsInputProps & {fieldSchema: ObjectSchemaType}) {
  const {value, onChange} = props

  const fields = useMemo(
    () => fieldSchema.fields.filter((field) => isAssistSupported(field.type)),
    [fieldSchema.fields],
  )

  useEmptySelectAllValue(value as OutputTypeItem[], fields, onChange)

  const onSelectChange = useCallback(
    (checked: boolean, selectedValue: string) => {
      if (checked) {
        if (value?.length) {
          onChange(PatchEvent.from(unset([{_key: selectedValue}])))
        } else {
          // we went from empty array to everything selected but one
          const items = fields
            .filter((f) => f.name !== selectedValue)
            .map((field) =>
              typed<OutputFieldItem>({
                _key: field.name,
                _type: 'sanity.assist.output.field',
                relativePath: field.name,
              }),
            )
          onChange(PatchEvent.from([setIfMissing([]), insert(items, 'after', [-1])]))
        }
      } else {
        const patchValue: OutputFieldItem = {
          _key: selectedValue,
          _type: 'sanity.assist.output.field',
          relativePath: selectedValue,
        }
        onChange(PatchEvent.from([setIfMissing([]), insert([patchValue], 'after', [-1])]))
      }
    },
    [onChange, value, fields],
  )

  return (
    <Stack space={2}>
      {fields.map((field) => {
        return (
          <Flex key={field.name} align="center" gap={2}>
            <Selectable
              value={field.name}
              title={field.type.title ?? field.name}
              arrayValue={value as OutputFieldItem[]}
              onChange={onSelectChange}
            />
          </Flex>
        )
      })}
    </Stack>
  )
}

function ArrayOutputInput({
  fieldSchema,
  ...props
}: ArrayOfObjectsInputProps & {fieldSchema: ArraySchemaType}) {
  const {value, onChange} = props

  const ofItems = useMemo(
    () => fieldSchema.of.filter((itemType) => isAssistSupported(itemType)),
    [fieldSchema.of],
  )

  useEmptySelectAllValue(value as OutputTypeItem[], ofItems, onChange)

  const onSelectChange = useCallback(
    (checked: boolean, selectedValue: string) => {
      if (checked) {
        if (value?.length) {
          onChange(PatchEvent.from(unset([{_key: selectedValue}])))
        } else {
          // we went from empty array to everything selected but one
          const items = ofItems
            .filter((f) => f.name !== selectedValue)
            .map((field) =>
              typed<OutputTypeItem>({
                _key: field.name,
                _type: 'sanity.assist.output.type',
                type: field.name,
              }),
            )
          onChange(PatchEvent.from([setIfMissing([]), insert(items, 'after', [-1])]))
        }
      } else {
        const patchValue: OutputTypeItem = {
          _key: selectedValue,
          _type: 'sanity.assist.output.type',
          type: selectedValue,
        }
        onChange(PatchEvent.from([setIfMissing([]), insert([patchValue], 'after', [-1])]))
      }
    },
    [onChange, value, ofItems],
  )
  return (
    <Stack space={2}>
      {ofItems.map((itemType) => {
        return (
          <Flex key={itemType.name}>
            <Selectable
              value={itemType.name}
              title={isType(itemType, 'block') ? 'Text' : (itemType.title ?? itemType.name)}
              arrayValue={value as OutputTypeItem[] | undefined}
              onChange={onSelectChange}
            />
          </Flex>
        )
      })}
    </Stack>
  )
}

function Selectable({
  title,
  arrayValue,
  value,
  onChange,
}: {
  title: string
  value: string
  arrayValue?: {_key: string}[]
  onChange: (checked: boolean, value: string) => void
}) {
  const checked = !arrayValue?.length || !!arrayValue?.find((v) => v._key === value)
  const handleChange = useCallback(() => onChange(checked, value), [onChange, checked, value])

  return (
    <Flex gap={2} align="flex-start">
      <Checkbox checked={checked} onChange={handleChange} />
      <Card marginTop={1} onClick={handleChange}>
        <Text style={{cursor: 'default'}} size={1}>
          {title}
        </Text>
      </Card>
    </Flex>
  )
}

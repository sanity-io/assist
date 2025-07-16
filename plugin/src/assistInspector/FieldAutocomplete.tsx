import {SearchIcon} from '@sanity/icons'
import {Autocomplete, Box, Breadcrumbs, Card, Flex, Text} from '@sanity/ui'
import {createElement, useCallback, useMemo} from 'react'
import {ObjectSchemaType} from 'sanity'

import {isType} from '../helpers/typeUtils'
import {FieldRef, getDocumentFieldRef} from './helpers'
import {useAiAssistanceConfig} from '../assistLayout/AiAssistanceConfigContext'

interface FieldSelectorProps {
  id: string
  schemaType: ObjectSchemaType
  fieldPath?: string
  onSelect: (path: string) => void
  includeDocument?: boolean
  filter?: (field: FieldRef) => boolean
}

export function FieldAutocomplete(props: FieldSelectorProps) {
  const {id, schemaType, fieldPath, onSelect, includeDocument, filter} = props

  const {getFieldRefs} = useAiAssistanceConfig()

  const fieldRefs = useMemo(() => {
    const refs = getFieldRefs(schemaType.name)
    if (includeDocument) {
      return [getDocumentFieldRef(schemaType), ...refs]
    }
    return refs
  }, [schemaType, includeDocument, getFieldRefs])

  const currentField = useMemo(
    () => fieldRefs.find((f) => f.key === fieldPath),
    [fieldPath, fieldRefs],
  )

  const autocompleteOptions = useMemo(
    () =>
      fieldRefs
        .filter((field) => (filter ? filter(field) : true))
        .filter((f) => !isType(f.schemaType, 'reference'))
        .map((field) => ({value: field.key, field})),
    [fieldRefs, filter],
  )

  const renderOption = useCallback((option: {value: string; field: FieldRef}) => {
    const {value, field} = option

    if (!value) {
      return (
        <Card as="button" padding={3} radius={1}>
          <Text accent size={1}>
            {option.value}
          </Text>
        </Card>
      )
    }

    if (isType(field.schemaType, 'document')) {
      return (
        <Card as="button" padding={3} radius={1}>
          <Text size={1} weight="semibold">
            The entire document
          </Text>
        </Card>
      )
    }

    return (
      <Card as="button" padding={3} radius={1}>
        <Flex gap={3}>
          <Text size={1}>{createElement(field.icon)}</Text>

          <FieldTitle field={field} />
        </Flex>
      </Card>
    )
  }, [])

  const renderValue = useCallback((value: string, option?: {value: string; field: FieldRef}) => {
    return option?.field.title ?? value
  }, [])

  const filterOption = useCallback((query: string, option: {value: string; field: FieldRef}) => {
    const lQuery = query.toLowerCase()
    return (
      option?.value?.toLowerCase().includes(lQuery) ||
      option?.field?.title?.toLowerCase().includes(lQuery)
    )
  }, [])

  return (
    <Autocomplete
      fontSize={1}
      icon={currentField ? currentField.icon : SearchIcon}
      onChange={onSelect}
      openButton
      id={id}
      options={autocompleteOptions}
      placeholder="Search for a field"
      radius={2}
      renderOption={renderOption}
      renderValue={renderValue}
      value={currentField?.key}
      filterOption={filterOption}
    />
  )
}

export function FieldTitle(props: {field: FieldRef}) {
  const splitTitle = props.field.title.split('/')
  return (
    <Box flex="none">
      <Breadcrumbs
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          marginTop: '-4px',
        }}
        separator={
          <Box marginTop={1}>
            <Text muted size={1}>
              /
            </Text>
          </Box>
        }
        space={1}
      >
        {splitTitle.slice(0, splitTitle.length - 1).map((pt, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <Box key={i} marginTop={1}>
            <Text muted size={1}>
              {pt.trim()}
            </Text>
          </Box>
        ))}
        <Box marginTop={1}>
          <Text size={1} weight="medium">
            {splitTitle[splitTitle.length - 1]}
          </Text>
        </Box>
      </Breadcrumbs>
    </Box>
  )
}

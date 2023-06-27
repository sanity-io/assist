import {SearchIcon} from '@sanity/icons'
import {Autocomplete, Box, Breadcrumbs, Card, Flex, Text} from '@sanity/ui'
import {createElement, useCallback, useMemo} from 'react'
import {FieldRef, getFieldRefs, getFieldRefsWithDocument} from './helpers'
import {ObjectSchemaType} from 'sanity'
import {isType} from '../helpers/typeUtils'

interface FieldSelectorProps {
  id: string
  schemaType: ObjectSchemaType
  fieldPath?: string
  onSelect: (path: string) => void
  includeDocument?: boolean
}

export function FieldAutocomplete(props: FieldSelectorProps) {
  const {id, schemaType, fieldPath, onSelect, includeDocument} = props

  const fieldNames = useMemo(() => {
    if (includeDocument) {
      return getFieldRefsWithDocument(schemaType)
    }
    return getFieldRefs(schemaType)
  }, [schemaType, includeDocument])
  const currentField = useMemo(
    () => fieldNames.find((f) => f.key === fieldPath),
    [fieldPath, fieldNames]
  )

  const autocompleteOptions = useMemo(
    () => fieldNames.map((field) => ({value: field.key, field})),
    [fieldNames]
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

    const splitTitle = field.title.split('/')
    return (
      <Card as="button" padding={3} radius={1}>
        <Flex gap={3}>
          <Text size={1}>{createElement(field.icon)}</Text>

          <Box flex="none">
            <Breadcrumbs
              separator={
                <Text muted size={1}>
                  /
                </Text>
              }
              space={1}
            >
              {splitTitle.slice(0, splitTitle.length - 1).map((pt, i) => (
                // eslint-disable-next-line react/no-array-index-key
                <Text key={i} muted size={1}>
                  {pt.trim()}
                </Text>
              ))}

              <Text size={1} weight="medium">
                {splitTitle[splitTitle.length - 1]}
              </Text>
            </Breadcrumbs>
          </Box>
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

  // const id = useId()
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

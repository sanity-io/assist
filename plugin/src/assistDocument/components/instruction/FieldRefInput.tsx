import {set, StringInputProps} from 'sanity'
import {useCallback, useContext, useEffect, useId, useRef} from 'react'
import {Box} from '@sanity/ui'
import {SelectedFieldContext} from '../SelectedFieldContext'
import {FieldAutocomplete} from '../../../assistInspector/FieldAutocomplete'
import {FieldRef} from '../../../assistInspector/helpers'
import {TypePathContext} from '../AssistDocumentForm'

export function FieldRefPathInput(props: StringInputProps) {
  const documentSchema = useContext(SelectedFieldContext)?.documentSchema
  const typePath = useContext(TypePathContext)
  const ref = useRef<HTMLDivElement>(null)
  const id = useId()
  const {onChange} = props

  useEffect(() => {
    ref.current?.querySelector('input')?.focus()
  }, [])

  const onSelect = useCallback((path: string) => onChange(set(path)), [onChange])

  const filter = useCallback(
    (field: FieldRef) => {
      if (!field.key.includes('|') || !typePath) {
        return true
      }
      if (field.key.includes('|') && !typePath.includes('|')) {
        return false
      }

      const fieldSegments = field.key.split('.')
      const lastArrayItemIndex = fieldSegments.findLastIndex((s) => s.includes('|'))
      const mustStartWith = fieldSegments.slice(0, lastArrayItemIndex + 1).join('.')
      return typePath.startsWith(mustStartWith)
    },
    [typePath]
  )
  if (!documentSchema) {
    return props.renderDefault(props)
  }

  return (
    <Box flex={1} style={{minWidth: 300}} ref={ref}>
      <FieldAutocomplete
        id={id}
        schemaType={documentSchema}
        onSelect={onSelect}
        fieldPath={props.value}
        filter={filter}
      />
    </Box>
  )
}

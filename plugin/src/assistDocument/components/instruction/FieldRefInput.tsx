import {set, StringInputProps} from 'sanity'
import {useCallback, useContext, useEffect, useId, useRef} from 'react'
import {Box} from '@sanity/ui'
import {SelectedFieldContext} from '../SelectedFieldContext'
import {FieldAutocomplete} from '../../../assistInspector/FieldAutocomplete'

export function FieldRefPathInput(props: StringInputProps) {
  const documentSchema = useContext(SelectedFieldContext)?.documentSchema
  const ref = useRef<HTMLDivElement>(null)
  const id = useId()
  const {onChange} = props

  useEffect(() => {
    ref.current?.querySelector('input')?.focus()
  }, [])

  const onSelect = useCallback((path: string) => onChange(set(path)), [onChange])

  if (!documentSchema) {
    return props.renderDefault(props)
  }

  return (
    <Box flex={1} style={{minWidth: 200}} ref={ref}>
      <FieldAutocomplete
        id={id}
        schemaType={documentSchema}
        onSelect={onSelect}
        fieldPath={props.value}
      />
    </Box>
  )
}

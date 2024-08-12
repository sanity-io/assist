import {Card, Flex, Switch, Text} from '@sanity/ui'
import {useCallback, useId} from 'react'
import {set, StringInputProps, unset, useCurrentUser} from 'sanity'

export function InstructionVisibility(props: StringInputProps) {
  const {value, onChange} = props

  const user = useCurrentUser()

  const handleChange = useCallback(() => {
    const newValue = value ? '' : (user?.id ?? '')
    onChange(newValue ? set(newValue) : unset())
  }, [onChange, user, value])

  const id = useId()

  return (
    <Card>
      <Flex gap={2} align="flex-start">
        <div style={{margin: '-3px 0'}}>
          <Switch
            {...props.elementProps}
            id={id}
            value={`${!value}`}
            checked={!value}
            onChange={handleChange}
            disabled={props.elementProps.readOnly}
          />
        </div>

        <Text muted size={1} weight="medium">
          <label htmlFor={id}>Make visible to all Studio members</label>
        </Text>
      </Flex>
    </Card>
  )
}

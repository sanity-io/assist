import {Box, Button, Card, ErrorBoundary, Flex, Stack, Text} from '@sanity/ui'
import {type ErrorInfo, type PropsWithChildren, useCallback, useMemo, useState} from 'react'
import {type InputProps, isArraySchemaType, PatchEvent, unset} from 'sanity'
import {styled} from 'styled-components'

import {isPortableTextArray} from '../helpers/typeUtils'

const WrapPreCard = styled(Card)`
  & pre {
    white-space: pre-wrap !important;
  }
`

export function SafeValueInput(props: InputProps) {
  return (
    <ErrorWrapper onChange={props.onChange}>
      <PteValueFixer {...props} />
    </ErrorWrapper>
  )
}

export function ErrorWrapper(
  props: PropsWithChildren<{onChange: (patchEvent: PatchEvent) => void}>,
) {
  const {onChange} = props
  const [error, setError] = useState<Error | undefined>()

  const catchError = useCallback((params: {error: Error; info: ErrorInfo}) => {
    setError(params.error)
  }, [])

  const unsetValue = useCallback(() => {
    onChange(PatchEvent.from(unset()))
    setError(undefined)
  }, [onChange])
  const dismiss = useCallback(() => setError(undefined), [])
  const catcher = <ErrorBoundary onCatch={catchError}>{props.children}</ErrorBoundary>

  return error ? (
    <Card border tone="critical" padding={2} contentEditable={false}>
      <Stack space={3}>
        <Text muted weight="semibold">
          An error occurred.
        </Text>

        <WrapPreCard flex={1} padding={2} tone="critical" border>
          {catcher}
        </WrapPreCard>

        <Flex width="fill" flex={1} gap={3}>
          <Box flex={1}>
            <Button text="Dismiss" onClick={dismiss} tone="primary" />
          </Box>
          <Button text="Unset value" onClick={unsetValue} tone="critical" />
        </Flex>
      </Stack>
    </Card>
  ) : (
    catcher
  )
}

function PteValueFixer(props: InputProps) {
  const isPortableText = useMemo(
    () => isArraySchemaType(props.schemaType) && isPortableTextArray(props.schemaType),
    [props.schemaType],
  )
  const value = props.value
  if (isPortableText && value && !(value as any[]).length) {
    return props.renderDefault({...props, value: undefined})
  }

  return props.renderDefault(props)
}

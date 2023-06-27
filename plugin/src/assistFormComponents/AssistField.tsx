import {FieldProps, isArraySchemaType} from 'sanity'
import {useAssistPresence} from '../presence/useAssistPresence'
import {useMemo} from 'react'
import {Box, Flex} from '@sanity/ui'
import {contextDocumentTypeName} from '../types'
import {isAssistSupported} from '../helpers/assistSupported'
import {isPortableTextArray, isType} from '../helpers/typeUtils'
import {AiFieldPresence} from '../presence/AiFieldPresence'
import {FieldActionsOnboarding} from '../onboarding/FieldActionsOnboarding'

export function AssistFieldWrapper(props: FieldProps) {
  const {schemaType} = props

  const isSupported = useMemo(() => isAssistSupported(schemaType), [schemaType])

  if (
    !isSupported ||
    schemaType.name.startsWith('sanity.') ||
    schemaType.name === contextDocumentTypeName
  ) {
    return props.renderDefault(props)
  }
  if (!isType(props.schemaType, 'document') && props.inputId !== 'root') {
    return <AssistField {...props}>{props.children}</AssistField>
  }

  return props.renderDefault(props)
}

export function AssistField(props: FieldProps) {
  const isPortableText = useMemo(
    () => !!(isArraySchemaType(props.schemaType) && isPortableTextArray(props.schemaType)),
    [props.schemaType]
  )

  const presence = useAssistPresence(props.path, isPortableText)

  const actions = (
    <Flex gap={2} align="center" justify="space-between">
      {presence.map((pre) => (
        <Box key={pre.user.id}>
          <AiFieldPresence key={pre.lastActiveAt} presence={pre} />
        </Box>
      ))}

      <FieldActionsOnboarding {...props}>{props.actions}</FieldActionsOnboarding>
    </Flex>
  )

  return props.renderDefault({...props, actions})
}

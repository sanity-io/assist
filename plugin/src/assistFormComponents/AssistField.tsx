import {FieldProps, isArraySchemaType, pathToString} from 'sanity'
import {useAssistPresence} from '../presence/useAssistPresence'
import {useContext, useMemo} from 'react'
import {Box, Flex} from '@sanity/ui'
import {contextDocumentTypeName} from '../types'
import {isAssistSupported} from '../helpers/assistSupported'
import {isPortableTextArray, isType} from '../helpers/typeUtils'
import {AiFieldPresence} from '../presence/AiFieldPresence'
import {AssistOnboardingPopover} from '../onboarding/FieldActionsOnboarding'
import {FirstAssistedPathContext} from '../onboarding/FirstAssistedPathProvider'
import {fieldOnboardingKey, useOnboardingFeature} from '../onboarding/onboardingStore'

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
  const {path} = props

  const isPortableText = useMemo(
    () => !!(isArraySchemaType(props.schemaType) && isPortableTextArray(props.schemaType)),
    [props.schemaType]
  )

  const presence = useAssistPresence(props.path, isPortableText)

  const firstAssistedPath = useContext(FirstAssistedPathContext)
  const isFirstAssisted = useMemo(
    () => pathToString(path) === firstAssistedPath,
    [path, firstAssistedPath]
  )

  const {showOnboarding, dismissOnboarding} = useOnboardingFeature(fieldOnboardingKey)

  const actions = (
    <Flex gap={2} align="center" justify="space-between">
      {presence.map((pre) => (
        <Box key={pre.user.id}>
          <AiFieldPresence key={pre.lastActiveAt} presence={pre} />
        </Box>
      ))}

      {isFirstAssisted && showOnboarding && <AssistOnboardingPopover dismiss={dismissOnboarding} />}
    </Flex>
  )

  return props.renderDefault({
    ...props,

    // When showing the onboarding, prevent default field actions from being rendered
    actions: isFirstAssisted && showOnboarding ? [] : props.actions,

    // Render presence (and possibly onboarding) in the internal slot (between presence and the field actions)
    // eslint-disable-next-line camelcase
    __internal_slot: actions,
  })
}

import {Box, Flex, Stack, Text} from '@sanity/ui'
import {useId, useMemo} from 'react'
import {FieldError, FieldMember, ObjectInputMember, ObjectInputProps} from 'sanity'

import {findFieldMember, findFieldsetMember} from '../helpers'

export function InstructionInput(props: ObjectInputProps) {
  return (
    <Stack space={[4, 4, 4, 5]}>
      <NameField {...props} />
      <ShareField {...props} />
      <ObjectMember fieldName={'prompt'} {...props} />
      <ObjectMember fieldName={'output'} {...props} />
    </Stack>
  )
}

function ObjectMember({fieldName, ...props}: ObjectInputProps & {fieldName: string}) {
  const member = findFieldMember(props.members, fieldName)
  return member ? <ObjectInputMember {...props} member={member} /> : null
}

const NONE: (FieldMember | FieldError)[] = []

function NameField(props: ObjectInputProps) {
  const fieldsetMember = findFieldsetMember(props.members, 'appearance')
  const titleId = useId()

  const members = fieldsetMember?.fieldSet.members ?? NONE
  const iconMember = findFieldMember(members, 'icon')
  const titleMember = findFieldMember(members, 'title')

  const titlePlaceholder = 'Untitled'
  const moddedTitleMember = useMemo(() => {
    if (!titleMember) {
      return undefined
    }
    if (titleMember.kind === 'error') {
      return titleMember
    }
    return {
      ...titleMember,
      field: {
        ...titleMember?.field,
        schemaType: {
          ...titleMember?.field.schemaType,
          placeholder: titlePlaceholder,
        },
      },
    }
  }, [titleMember, titlePlaceholder])

  return (
    <Stack space={5}>
      <Stack space={2}>
        <Flex gap={1}>
          <Text as="label" weight="semibold" size={1} htmlFor={titleId}>
            Name
          </Text>
        </Flex>

        <Text muted size={1}>
          How this instruction appears in menus
        </Text>

        <Flex align="center">
          {iconMember && (
            <Box flex="none">
              <ObjectInputMember {...props} member={iconMember} />
            </Box>
          )}
          {moddedTitleMember && (
            <Box flex={1} style={{marginLeft: -1}}>
              <ObjectInputMember {...props} member={moddedTitleMember} />
            </Box>
          )}
        </Flex>
      </Stack>
    </Stack>
  )
}

function ShareField(props: ObjectInputProps) {
  const fieldsetMember = findFieldsetMember(props.members, 'appearance')
  const members = fieldsetMember?.fieldSet.members ?? NONE
  const visibilityMember = findFieldMember(members, 'userId')

  return <>{visibilityMember && <ObjectInputMember {...props} member={visibilityMember} />}</>
}

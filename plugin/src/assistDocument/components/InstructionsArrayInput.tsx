import {useMemo} from 'react'
import {ArrayOfObjectsInputProps, useCurrentUser} from 'sanity'

import {StudioInstruction} from '../../types'

export function InstructionsArrayInput(props: ArrayOfObjectsInputProps) {
  const user = useCurrentUser()

  const originalValue = props.value as StudioInstruction[] | undefined
  const originalMembers = props.members
  const value = useMemo(
    () => (originalValue ?? []).filter((v) => !v.userId || v.userId === user?.id),
    [originalValue, user],
  )
  const members = useMemo(
    () =>
      (originalMembers ?? []).filter((v) => {
        if (v.kind === 'error') {
          return true
        }
        const value = v?.item?.value as any
        return !value.userId || value.userId === user?.id
      }),
    [originalMembers, user],
  )
  return props.renderDefault({...props, value, members})
}

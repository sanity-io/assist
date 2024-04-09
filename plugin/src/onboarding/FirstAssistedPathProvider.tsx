import {createContext, PropsWithChildren, useMemo} from 'react'
import {FieldMember, ObjectInputProps, pathToString} from 'sanity'

import {isAssistSupported} from '../helpers/assistSupported'

export const FirstAssistedPathContext = createContext<string | undefined>(undefined)

export interface FirstAssistedPathProviderProps {
  members: ObjectInputProps['members']
}

export function FirstAssistedPathProvider(
  props: PropsWithChildren<FirstAssistedPathProviderProps>,
) {
  const {members} = props

  const firstAssistedPath = useMemo(() => {
    const firstAssisted = members.find(
      (member): member is FieldMember =>
        member.kind === 'field' && isAssistSupported(member.field.schemaType),
    )
    return firstAssisted?.field.path ? pathToString(firstAssisted?.field.path) : undefined
  }, [members])

  return (
    <FirstAssistedPathContext.Provider value={firstAssistedPath}>
      {props.children}
    </FirstAssistedPathContext.Provider>
  )
}

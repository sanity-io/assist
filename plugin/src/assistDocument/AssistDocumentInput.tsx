import {useLayer} from '@sanity/ui'
import {useMemo} from 'react'
import type {InputProps, ObjectInputProps, ObjectSchemaType} from 'sanity'
import {useDocumentPane} from 'sanity/structure'

import {ConnectFromRegion} from '../_lib/connector'
import {assistFormId} from '../_lib/form/constants'
import {usePathKey} from '../helpers/misc'
import {isType} from '../helpers/typeUtils'
import {FirstAssistedPathProvider} from '../onboarding/FirstAssistedPathProvider'
import {assistDocumentTypeName} from '../types'
import {useInstructionToaster} from './hooks/useInstructionToaster'

export function AssistDocumentInputWrapper(props: InputProps) {
  if (!isType(props.schemaType, 'document') && props.id !== 'root' && props.id !== assistFormId) {
    return <AssistInput {...props} />
  }

  const documentId = (props.value as any)?._id as string | undefined
  if (!documentId) {
    return props.renderDefault(props)
  }

  return <AssistDocumentInput {...(props as ObjectInputProps)} documentId={documentId} />
}

function AssistDocumentInput({documentId, ...props}: ObjectInputProps & {documentId: string}) {
  useInstructionToaster(documentId, props.schemaType)

  const schemaType = useMemo(() => {
    if (props.schemaType.name !== assistDocumentTypeName) {
      return props.schemaType
    }
    return {
      ...props.schemaType,
      type: {
        ...props.schemaType.type,
        // compatability with i18nArrays plugin that requires this to be document
        name: 'document',
      },
    } as ObjectSchemaType
  }, [props.schemaType])

  return (
    <FirstAssistedPathProvider members={props.members}>
      {props.renderDefault({...props, schemaType})}
    </FirstAssistedPathProvider>
  )
}

function AssistInput(props: InputProps) {
  const {zIndex} = useLayer()
  const {paneKey} = useDocumentPane()
  const pathKey = usePathKey(props.path)

  return (
    <ConnectFromRegion _key={`${paneKey}_${pathKey}`} zIndex={zIndex} style={{minWidth: 0}}>
      {props.renderDefault(props)}
    </ConnectFromRegion>
  )
}

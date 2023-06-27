import {InputProps, ObjectInputProps} from 'sanity'
import {AssistDocumentContextProvider} from './AssistDocumentContextProvider'
import {FirstAssistedPathProvider} from '../onboarding/FirstAssistedPathProvider'
import {useInstructionToaster} from './hooks/useInstructionToaster'
import {isType} from '../helpers/typeUtils'
import {useLayer} from '@sanity/ui'
import {useDocumentPane} from 'sanity/desk'
import {usePathKey} from '../helpers/misc'
import {ConnectFromRegion} from '../_lib/connector'

export function AssistDocumentInputWrapper(props: InputProps) {
  if (!isType(props.schemaType, 'document') && props.id !== 'root') {
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

  return (
    <FirstAssistedPathProvider members={props.members}>
      <AssistDocumentContextProvider schemaType={props.schemaType} documentId={documentId}>
        {props.renderDefault(props)}
      </AssistDocumentContextProvider>
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

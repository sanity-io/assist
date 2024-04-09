import {ArrowLeftIcon} from '@sanity/icons'
import {Button} from '@sanity/ui'
import {useCallback} from 'react'
import {useDocumentPane} from 'sanity/structure'

import {aiInspectorId} from '../../../assistInspector/constants'
import {instructionParam} from '../../../types'

export function BackToInstructionListLink() {
  const {openInspector} = useDocumentPane()

  const goBack = useCallback(
    () => openInspector(aiInspectorId, {[instructionParam]: undefined as any}),
    [openInspector],
  )

  return (
    <div>
      <Button
        as="a"
        fontSize={1}
        icon={ArrowLeftIcon}
        mode="bleed"
        padding={1}
        space={2}
        onClick={goBack}
        text="  Instructions"
        textAlign="left"
      />
    </div>
  )
}

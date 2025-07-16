import {ThemeProvider} from '@sanity/ui'
import {useState} from 'react'
import {LayoutProps} from 'sanity'

import {Connector, ConnectorsProvider} from '../_lib/connector'
import {AssistConnectorsOverlay} from '../assistConnectors'
import {AssistPluginConfig} from '../plugin'
import {FieldTranslationProvider} from '../translate/FieldTranslationProvider'
import {StudioInstruction} from '../types'
import {RunInstructionRequest} from '../useApiClient'
import {RunInstructionProvider} from './RunInstructionProvider'
import {AiAssistanceConfigProvider} from './AiAssistanceConfigProvider'

export interface AIStudioLayoutProps extends LayoutProps {
  config: AssistPluginConfig
}

export type RunInstructionArgs = Omit<RunInstructionRequest, 'instructionKey' | 'userText'> & {
  instruction: StudioInstruction
}

export function AssistLayout(props: AIStudioLayoutProps) {
  const [connectors, setConnectors] = useState<Connector[]>([])

  return (
    <AiAssistanceConfigProvider config={props.config}>
      <RunInstructionProvider>
        <FieldTranslationProvider>
          <ConnectorsProvider onConnectorsChange={setConnectors}>
            {props.renderDefault(props)}
            <ThemeProvider tone="default">
              <AssistConnectorsOverlay connectors={connectors} />
            </ThemeProvider>
          </ConnectorsProvider>
        </FieldTranslationProvider>
      </RunInstructionProvider>
    </AiAssistanceConfigProvider>
  )
}

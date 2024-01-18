import {useState} from 'react'
import {LayoutProps} from 'sanity'
import {Connector, ConnectorsProvider} from '../_lib/connector'
import {AssistConnectorsOverlay} from '../assistConnectors'
import {AssistPluginConfig} from '../plugin'
import {AiAssistanceConfigProvider} from './AiAssistanceConfigContext'
import {RunInstructionRequest} from '../useApiClient'
import {StudioInstruction} from '../types'
import {RunInstructionProvider} from './RunInstructionProvider'
import {ThemeProvider} from '@sanity/ui'
import {FieldTranslationProvider} from '../translate/FieldTranslationProvider'

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

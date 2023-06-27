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
import {AlphaMigration} from './AlphaMigration'

export interface AIStudioLayoutProps extends LayoutProps {
  config: AssistPluginConfig
}

export type RunInstructionArgs = Omit<RunInstructionRequest, 'instructionKey' | 'userText'> & {
  instruction: StudioInstruction
}

export function AssistLayout(props: AIStudioLayoutProps) {
  const [connectors, setConnectors] = useState<Connector[]>([])
  const migrate = props.config.alphaMigration ?? true

  return (
    <AiAssistanceConfigProvider config={props.config}>
      {migrate ? <AlphaMigration /> : null}
      <RunInstructionProvider>
        <ConnectorsProvider onConnectorsChange={setConnectors}>
          {props.renderDefault(props)}
          <ThemeProvider tone="default">
            <AssistConnectorsOverlay connectors={connectors} />
          </ThemeProvider>
        </ConnectorsProvider>
      </RunInstructionProvider>
    </AiAssistanceConfigProvider>
  )
}

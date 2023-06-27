import {BlockProps} from 'sanity'
import {Box} from '@sanity/ui'
import {createContext} from 'react'

// workaround for preview value sometimes lagging behind
export const InlineBlockValueContext = createContext<unknown>(undefined)

export function AssistInlineFormBlock(props: BlockProps) {
  return (
    <InlineBlockValueContext.Provider value={props.value}>
      <Box flex={1}>{props.renderDefault(props)}</Box>
    </InlineBlockValueContext.Provider>
  )
}

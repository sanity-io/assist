import {createContext} from 'react'
import {BlockProps} from 'sanity'

// workaround for preview value sometimes lagging behind
export const InlineBlockValueContext = createContext<unknown>(undefined)

export function AssistInlineFormBlock(props: BlockProps) {
  return (
    <InlineBlockValueContext.Provider value={props.value}>
      <>{props.renderDefault(props)}</>
    </InlineBlockValueContext.Provider>
  )
}

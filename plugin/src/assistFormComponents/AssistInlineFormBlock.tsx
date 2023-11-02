import {BlockProps} from 'sanity'
import {createContext} from 'react'

// workaround for preview value sometimes lagging behind
export const InlineBlockValueContext = createContext<unknown>(undefined)

export function AssistInlineFormBlock(props: BlockProps) {
  return (
    <InlineBlockValueContext.Provider value={props.value}>
      <>{props.renderDefault(props)}</>
    </InlineBlockValueContext.Provider>
  )
}

import {createContext} from 'react'

export interface AssistTypeContextValue {
  typePath?: string
  documentType?: string
}
export const AssistTypeContext = createContext<AssistTypeContextValue>({})

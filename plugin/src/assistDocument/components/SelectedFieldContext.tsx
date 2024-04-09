import {createContext} from 'react'
import {ObjectSchemaType, SchemaType} from 'sanity'

export interface SelectedFieldContextValue {
  documentSchema?: ObjectSchemaType
  fieldSchema?: SchemaType
}

export const SelectedFieldContext = createContext<SelectedFieldContextValue | undefined>(undefined)
export const SelectedFieldContextProvider = SelectedFieldContext.Provider

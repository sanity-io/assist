import {ObjectSchemaType, SchemaType} from 'sanity'
import {createContext} from 'react'

export interface SelectedFieldContextValue {
  documentSchema?: ObjectSchemaType
  fieldSchema?: SchemaType
}

export const SelectedFieldContext = createContext<SelectedFieldContextValue | undefined>(undefined)
export const SelectedFieldContextProvider = SelectedFieldContext.Provider

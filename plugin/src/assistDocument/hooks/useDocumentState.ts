import {useEditState} from 'sanity'

export function useDocumentState<T>(id: string, docType: string): T | undefined {
  const state = useEditState(id, docType)
  return (state.draft || state.published) as T | undefined
}

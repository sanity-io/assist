import {assistDocumentIdPrefix, assistDocumentStatusIdPrefix} from '../types'

const aiDocPrefixPattern = new RegExp(`^${assistDocumentIdPrefix}`)

export function publicId(id: string) {
  return id.replace('drafts.', '')
}

export function assistDocumentId(documentType: string) {
  return `${assistDocumentIdPrefix}${documentType}`
}

export function documentTypeFromAiDocumentId(id: string) {
  return id.replace(aiDocPrefixPattern, '')
}

export function assistTasksStatusId(documentId: string) {
  return `${assistDocumentStatusIdPrefix}${publicId(documentId)}`
}

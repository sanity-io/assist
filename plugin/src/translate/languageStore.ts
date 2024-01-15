export const toFieldLanguagesKeyPrefix = 'sanityStudio:assist:field-languages:from:'

export function getPreferredToFieldLanguages(fromLanguageId: string): string[] {
  if (typeof localStorage === 'undefined') {
    return []
  }

  const value = localStorage.getItem(`${toFieldLanguagesKeyPrefix}${fromLanguageId}`)
  return value ? (JSON.parse(value) as string[]) : []
}

export function setPreferredToFieldLanguages(fromLanguageId: string, languageIds: string[]) {
  if (typeof localStorage === 'undefined') {
    return
  }

  localStorage.setItem(`${toFieldLanguagesKeyPrefix}${fromLanguageId}`, JSON.stringify(languageIds))
}

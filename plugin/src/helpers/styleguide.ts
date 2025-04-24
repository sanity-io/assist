import {packageName} from '../constants'
import {TranslateStyleguide, TranslateStyleguideContext} from '../translate/types'

export function validateStyleguide(styleguide: string) {
  if (styleguide.length > 2000) {
    throw new Error(
      `[${packageName}]: \`translate.styleguide\` value is too long. It must be 2000 characters or less, but was ${styleguide.length} characters`,
    )
  }
}

export function createStyleGuideResolver(
  styleguide: TranslateStyleguide | undefined,
  context: TranslateStyleguideContext,
) {
  return async () => {
    if (typeof styleguide !== 'function') {
      return styleguide
    }
    const styleguideResult = await styleguide(context)
    validateStyleguide(styleguideResult)
    return styleguideResult
  }
}

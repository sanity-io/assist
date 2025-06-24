import {type AssistFieldActionProps, defineAssistFieldActionGroup} from '@sanity/assist'
import {useMemo} from 'react'
import {useAutoFillFieldAction} from './generate/autoFill'
import {useFillDocumentFromInput} from './generate/fillDocumentFromInput'
import {useGenerateImageFromInput} from './generate/generateImageFromInput'
import {useSummarizeDocument} from './generate/summarizeDocument'
import {useAnswerQuestion} from './prompt/answerQuestion'
import {useFixSpelling} from './transform/fixSpelling'
import {useImageDescriptionWithFieldNames} from './transform/imageDescriptionWithFieldName'
import {useImageDescriptionWithOptions} from './transform/imageDescriptionWithOptions'
import {useReplacePhrases} from './transform/replacePhrase'
import {useTransformImage} from './transform/transformImage'
import {useTranslateToAny} from './translate/translateToAny'
import {useInferAction} from './prompt/inferAction'

/**
 * Example of how the individual examples can be combined and grouped for `useFieldActions.`
 * @param props
 */
export function useExampleFieldActions(props: AssistFieldActionProps) {
  const fillAction = useAutoFillFieldAction(props)
  const fillDocumentFromInput = useFillDocumentFromInput(props)
  const generateImageFromInput = useGenerateImageFromInput(props)
  const summarizeDocument = useSummarizeDocument(props)

  const answerQuestion = useAnswerQuestion(props)

  const fixSpelling = useFixSpelling(props)
  const imageDescriptionWithFieldNames = useImageDescriptionWithFieldNames(props)
  const imageDescriptionWithOptions = useImageDescriptionWithOptions(props)
  const replacePhrases = useReplacePhrases(props)
  const transformImage = useTransformImage(props)

  const translateToAny = useTranslateToAny(props)

  const inferAction = useInferAction(props)

  return useMemo(
    () => [
      defineAssistFieldActionGroup({
        title: 'Generate',
        children: [fillAction, fillDocumentFromInput, generateImageFromInput, summarizeDocument],
      }),

      defineAssistFieldActionGroup({
        title: 'Transform',
        children: [
          fixSpelling,
          imageDescriptionWithFieldNames,
          imageDescriptionWithOptions,
          replacePhrases,
          transformImage,
        ],
      }),

      defineAssistFieldActionGroup({
        title: 'Translate',
        children: [translateToAny],
      }),

      defineAssistFieldActionGroup({
        title: 'Prompt',
        children: [answerQuestion, inferAction],
      }),
    ],
    [
      fillAction,
      fillDocumentFromInput,
      generateImageFromInput,
      summarizeDocument,
      answerQuestion,
      fixSpelling,
      imageDescriptionWithFieldNames,
      imageDescriptionWithOptions,
      replacePhrases,
      transformImage,
      translateToAny,
      inferAction,
    ],
  )
}

import {SparklesIcon} from '@sanity/icons'
import {DocumentInspector, typed} from 'sanity'
import {aiInspectorId} from './constants'
import {AssistInspectorWrapper} from './AssistInspector'
import {AssistInspectorRouteParams, fieldPathParam, instructionParam} from '../types'
import {pluginTitle} from '../constants'

export const assistInspector: DocumentInspector = {
  name: aiInspectorId,
  useMenuItem: () => ({
    icon: SparklesIcon,
    title: pluginTitle,
    hidden: true,
    showAsAction: false,
  }),
  component: AssistInspectorWrapper,
  onClose({params}) {
    return {
      params: typed<AssistInspectorRouteParams>({
        ...params,
        [fieldPathParam]: undefined,
        [instructionParam]: undefined,
      }) as typeof params,
    }
  },
}

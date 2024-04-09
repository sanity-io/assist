import {SparklesIcon} from '@sanity/icons'
import {DocumentInspector, typed} from 'sanity'

import {pluginTitle} from '../constants'
import {AssistInspectorRouteParams, fieldPathParam, instructionParam} from '../types'
import {AssistInspectorWrapper} from './AssistInspector'
import {aiInspectorId} from './constants'

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

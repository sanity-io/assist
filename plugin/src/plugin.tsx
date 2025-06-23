import type {SanityClient} from '@sanity/client'
import {definePlugin, isObjectSchemaType} from 'sanity'

import {AssistDocumentInputWrapper} from './assistDocument/AssistDocumentInput'
import {AssistDocumentLayout} from './assistDocument/AssistDocumentLayout'
import {AssistFieldWrapper} from './assistFormComponents/AssistField'
import {AssistFormBlock} from './assistFormComponents/AssistFormBlock'
import {AssistInlineFormBlock} from './assistFormComponents/AssistInlineFormBlock'
import {AssistItem} from './assistFormComponents/AssistItem'
import {assistInspector} from './assistInspector'
import {AssistLayout} from './assistLayout/AssistLayout'
import {AssistConfig} from './assistTypes'
import {ImageContextProvider} from './components/ImageContext'
import {SafeValueInput} from './components/SafeValueInput'
import {packageName} from './constants'
import {assistFieldActions} from './fieldActions/assistFieldActions'
import {isSchemaAssistEnabled} from './helpers/assistSupported'
import {validateStyleguide} from './helpers/styleguide'
import {isImage} from './helpers/typeUtils'
import {createAssistDocumentPresence} from './presence/AssistDocumentPresence'
import {schemaTypes} from './schemas'
import {TranslationConfig} from './translate/types'
import {assistDocumentTypeName, AssistPreset} from './types'
import {AssistFieldActionNode, AssistFieldActionProps} from './fieldActions/customFieldActions'

export interface AssistPluginConfig {
  translate?: TranslationConfig

  /**
   * Config that affects all instructions
   */
  assist?: AssistConfig

  fieldActions?: {
    title?: string
    /**
     * The returned array can include `undefined` entries in the action array. These will be filtered out.
     */
    useFieldActions?: (props: AssistFieldActionProps) => (AssistFieldActionNode | undefined)[]
  }

  /**
   * @internal
   */
  __customApiClient?: (defaultClient: SanityClient) => SanityClient

  /**
   * @internal
   */
  __presets?: Record<string, AssistPreset>
}

export const assist = definePlugin<AssistPluginConfig | void>((config) => {
  const configWithDefaults = config ?? {}
  const styleguide = configWithDefaults.translate?.styleguide || ''
  const maxPathDepth = configWithDefaults.assist?.maxPathDepth
  const temperature = configWithDefaults.assist?.temperature

  if (typeof styleguide === 'string') {
    validateStyleguide(styleguide)
  }

  if (maxPathDepth !== undefined && (maxPathDepth < 1 || maxPathDepth > 12)) {
    throw new Error(
      `[${packageName}]: \`assist.maxPathDepth\` must be be in the range [1,12] inclusive, but was ${maxPathDepth}`,
    )
  }

  if (temperature !== undefined && (temperature < 0 || temperature > 1)) {
    throw new Error(
      `[${packageName}]: \`assist.maxPathDepth\` must be be in the range [0,1] inclusive, but was ${temperature}`,
    )
  }

  return {
    name: packageName,
    // the addition of global references broke auto updating studios
    // new versions of studio know to look for this prop on assist plugin, and filter + console.warn if it is missing
    ...({handlesGDR: true} as any),
    schema: {
      types: schemaTypes,
    },
    i18n: {
      bundles: [{}],
    },

    document: {
      inspectors: (prev, context) => {
        const documentType = context.documentType
        const docSchema = context.schema.get(documentType)
        if (docSchema && isSchemaAssistEnabled(docSchema)) {
          return [...prev, assistInspector]
        }
        return prev
      },
      unstable_fieldActions: (prev, {documentType, schema}) => {
        if (documentType === assistDocumentTypeName) {
          return []
        }
        const docSchema = schema.get(documentType)
        if (docSchema && isSchemaAssistEnabled(docSchema)) {
          return [...prev, assistFieldActions]
        }
        return prev
      },
      unstable_languageFilter: (prev, {documentId, schema, schemaType}) => {
        if (schemaType === assistDocumentTypeName) {
          return []
        }
        const docSchema = schema.get(schemaType)
        if (docSchema && isObjectSchemaType(docSchema) && isSchemaAssistEnabled(docSchema)) {
          return [...prev, createAssistDocumentPresence(documentId)]
        }
        return prev
      },
      components: {
        unstable_layout: AssistDocumentLayout,
      },
    },

    studio: {
      components: {
        layout: function Layout(props) {
          return <AssistLayout {...props} config={configWithDefaults} />
        },
      },
    },

    form: {
      components: {
        input: AssistDocumentInputWrapper,
        field: AssistFieldWrapper,
        item: AssistItem,
        block: AssistFormBlock,
        inlineBlock: AssistInlineFormBlock,
      },
    },

    plugins: [
      definePlugin({
        name: `${packageName}/safe-value-input`,
        form: {components: {input: SafeValueInput}},
      })(),

      definePlugin({
        name: `${packageName}/generate-caption`,
        form: {
          components: {
            input: (props) => {
              const {schemaType} = props

              if (isImage(schemaType)) {
                return <ImageContextProvider {...props} />
              }
              return props.renderDefault(props)
            },
          },
        },
      })(),
    ],
  }
})

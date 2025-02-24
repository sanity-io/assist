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
import {ImageContextProvider} from './components/ImageContext'
import {SafeValueInput} from './components/SafeValueInput'
import {packageName} from './constants'
import {assistFieldActions} from './fieldActions/assistFieldActions'
import {isSchemaAssistEnabled} from './helpers/assistSupported'
import {isImage} from './helpers/typeUtils'
import {createAssistDocumentPresence} from './presence/AssistDocumentPresence'
import {schemaTypes} from './schemas'
import {TranslationConfig} from './translate/types'
import {assistDocumentTypeName, AssistPreset} from './types'

export interface AssistPluginConfig {
  translate?: TranslationConfig

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
  return {
    name: packageName,

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

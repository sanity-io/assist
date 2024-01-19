import {defineConfig, isKeySegment} from 'sanity'
import {deskTool} from 'sanity/desk'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemas'
import {codeInput} from '@sanity/code-input'
import {apiHost, dataset, pluginApiHost, projectId} from './env'
import {assist} from '../plugin/src'
import {embeddingsIndexDashboard} from '@sanity/embeddings-index-ui'
import {defaultLanguages, languages, translatedDocTypes} from './src/lang/languages'
import {documentInternationalization} from '@sanity/document-internationalization'
import {languageFilter} from '@sanity/language-filter'
import {internationalizedArray} from 'sanity-plugin-internationalized-array'
import {featureProduct, languageArticle} from './schemas/languageArticle'

export default defineConfig({
  name: 'default',
  title: 'Sanity AI Assist',

  projectId,
  dataset,
  apiHost,

  plugins: [
    deskTool(),
    visionTool(),
    codeInput(),
    assist({
      translate: {
        field: {
          documentTypes: [languageArticle.name],
          selectLanguageParams: {language: 'localePte.en', x: 'localePte'},
          languages: (client, params) => {
            console.log(params)
            return new Promise((resolve) => {
              setTimeout(() => resolve(languages), 500)
            })
          },
        },
        document: {
          documentTypes: translatedDocTypes,
          languageField: 'language',
        },
      },

      __customApiClient: (defaultClient) =>
        pluginApiHost
          ? defaultClient.withConfig({
              apiHost: pluginApiHost,
              useProjectHostname: false,
              withCredentials: false,
            })
          : defaultClient,
    }),
    documentInternationalization({
      supportedLanguages: languages,
      schemaTypes: translatedDocTypes,
      weakReferences: true,
      apiVersion: '2023-05-22',
    }),
    languageFilter({
      supportedLanguages: languages,
      defaultLanguages,
      documentTypes: [languageArticle.name],
      apiVersion: '2023-05-22',
      filterField: (enclosingType, member, selectedLanguageIds) => {
        if (
          enclosingType.jsonType === 'object' &&
          enclosingType.name.startsWith('internationalizedArray') &&
          'kind' in member
        ) {
          const pathEnd = member.field.path.slice(-2)
          const language =
            pathEnd[1] === 'value' && isKeySegment(pathEnd[0]) ? pathEnd[0]._key : null
          return language ? selectedLanguageIds.includes(language) : false
        }

        if (enclosingType.jsonType === 'object' && enclosingType.name.startsWith('locale')) {
          return selectedLanguageIds.includes(member.name)
        }

        return true
      },
    }),
    internationalizedArray({
      languages,
      fieldTypes: ['string', featureProduct.name],
    }),
    embeddingsIndexDashboard(),
  ],
  schema: {
    types: schemaTypes,
  },
})

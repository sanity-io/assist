import {defineConfig, isKeySegment} from 'sanity'
import {structureTool} from 'sanity/structure'
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
import {mockArticle} from './schemas/mockArticle'
import {brokenTypeName} from './schemas/brokenTypeName'
import {CloseIcon} from '@sanity/icons'

export default defineConfig({
  name: 'default',
  title: 'Sanity AI Assist',

  projectId,
  dataset,
  apiHost,

  plugins: [
    structureTool({
      structure: (S) => {
        return S.list({
          id: 'root',
          title: 'Document types',
          items: S.documentTypeListItems().map((item) => {
            // some Studios use type names that will otherwise crash the structure tool, by assigning a custom id to them (without illegal chars)
            // we include one such type here, for testing
            if (item.getId() === brokenTypeName.name) {
              return S.listItem({
                id: 'fixed-type',
                icon: CloseIcon,
                title: 'Renamed type name',
                //@ts-expect-error this works but gives errors, broken typings?
                child: S.documentTypeList({
                  schemaType: brokenTypeName.name,
                  id: 'broken_type',
                }),
              })
            }
            return item
          }),
        })
      },
    }),
    visionTool(),
    codeInput(),
    assist({
      assist: {
        maxPathDepth: 6,
        localeSettings: ({defaultSettings}) => defaultSettings,
        temperature: 1,
      },
      translate: {
        field: {
          documentTypes: [languageArticle.name],
          selectLanguageParams: {language: 'localePte.en', x: 'localePte'},
          languages: (client, params) => {
            return new Promise((resolve) => {
              setTimeout(() => resolve(languages), 500)
            })
          },
          maxPathDepth: 12,
        },
        document: {
          documentTypes: translatedDocTypes,
          languageField: 'language',
        },
        styleguide: 'Retain the word "Headless" in all translations as is, regardless of language.',
      },

      __customApiClient: (defaultClient) =>
        pluginApiHost
          ? defaultClient.withConfig({
              apiHost: pluginApiHost,
              useProjectHostname: false,
              withCredentials: false,
            })
          : defaultClient,

      __presets: {
        [mockArticle.name]: {
          fields: [
            {
              path: 'title',
              instructions: [
                {
                  _key: 'preset-instruction-1',
                  title: 'My preset',
                  icon: 'presentation',
                  prompt: [
                    {
                      _key: 'block-1',
                      _type: 'block',
                      children: [{_key: 'c-1', _type: 'span', text: 'say-hello', marks: []}],
                    },
                  ],
                },
              ],
            },
          ],
        },
      },
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
      buttonLocations: ['unstable__fieldAction'],
    }),
    embeddingsIndexDashboard(),
  ],
  schema: {
    types: schemaTypes,
  },
})

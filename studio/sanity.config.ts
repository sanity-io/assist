import {defineConfig, isKeySegment, pathToString, useClient} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemas'
import {codeInput} from '@sanity/code-input'

import {apiHost, dataset, pluginApiHost, projectId} from './env'
import {
  assist,
  defineAssistFieldAction,
  defineAssistFieldActionGroup,
  defineFieldActionDivider,
} from '../plugin/src'
import {embeddingsIndexDashboard} from '@sanity/embeddings-index-ui'
import {defaultLanguages, languages, translatedDocTypes} from './src/lang/languages'
import {documentInternationalization} from '@sanity/document-internationalization'
import {languageFilter} from '@sanity/language-filter'
import {internationalizedArray} from 'sanity-plugin-internationalized-array'
import {featureProduct, languageArticle} from './schemas/languageArticle'
import {mockArticle} from './schemas/mockArticle'
import {brokenTypeName} from './schemas/brokenTypeName'
import {CloseIcon, EditIcon, ErrorOutlineIcon, TranslateIcon, UserIcon} from '@sanity/icons'
import {useMemo} from 'react'
import {useUserInput} from '../plugin/src/fieldActions/useUserInput'
import {SanityClient} from '@sanity/client'
import {useToast} from '@sanity/ui'

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
        styleguide: () => {
          return Promise.resolve(
            'Retain the word "Headless" in all translations as is, regardless of language.',
          )
        },
      },

      fieldActions: {
        useFieldActions: (props) => {
          const {
            documentSchemaType,
            actionType,
            schemaId,
            getDocumentValue,
            getConditionalPaths,
            documentIdForAction,
            path,
            schemaType,
          } = props
          const client = useClient({apiVersion: 'vX'})
          const {push: pushToast} = useToast()
          const getUserInput = useUserInput()
          return useMemo(() => {
            if (actionType === 'field') {
              return [
                defineAssistFieldActionGroup({
                  title: 'Generate',
                  children: [
                    defineAssistFieldAction({
                      title: 'Fill field',
                      icon: EditIcon,
                      onAction: async () => {
                        await client.agent.action.generate({
                          schemaId,
                          targetDocument: {
                            operation: 'createIfNotExists',
                            _id: documentIdForAction,
                            _type: documentSchemaType.name,
                            initialValues: getDocumentValue(),
                          },
                          instruction: `
                        We are generating a new value for a document field.
                        The document type is ${documentSchemaType.name}, and the document type title is ${documentSchemaType.title}
                        The document language is: "$lang" (use en-US if unspecified)
                        The document value is:
                        $doc
                        ---
                        We are in the following field:
                        JSON-path: ${pathToString(path)}
                        Title: ${schemaType.title}
                        Value: $field (consider it empty if undefined)
                        ---
                        Generate a new field value. The new value should be relevant to the document type and context.
                        Keep it interesting. Generate using the document language.
                     `,
                          instructionParams: {
                            doc: {type: 'document'},
                            field: {type: 'field', path},
                            lang: {type: 'field', path: ['language']},
                          },
                          target: {
                            path,
                          },
                          conditionalPaths: {
                            paths: getConditionalPaths(),
                          },
                        })
                      },
                    }),
                  ],
                }),

                defineAssistFieldAction({
                  title: 'Fix spelling',
                  icon: TranslateIcon,
                  onAction: async () => {
                    await client.agent.action.transform({
                      schemaId,
                      documentId: documentIdForAction,
                      instruction: 'Fix any spelling mistakes',
                      instructionParams: {field: {type: 'field', path}},
                      // no need to send path for document actions
                      target: path.length ? {path} : undefined,
                      conditionalPaths: {paths: getConditionalPaths()},
                    })
                  },
                }),

                defineAssistFieldActionGroup({
                  title: 'Test actions',
                  children: [
                    defineAssistFieldAction({
                      title: 'Throws',
                      icon: ErrorOutlineIcon,
                      onAction: () => {
                        throw new Error('cant touch this')
                      },
                    }),
                    defineAssistFieldAction({
                      title: 'Async Throws',
                      icon: ErrorOutlineIcon,
                      onAction: () => {
                        throw new Error('cant touch this')
                      },
                    }),
                    defineFieldActionDivider(),
                    defineAssistFieldAction({
                      title: 'Log user input',
                      icon: UserIcon,
                      onAction: async () => {
                        const inputResult = await getUserInput({
                          title: 'What do you want to do?',
                          inputs: [
                            {
                              id: 'topic',
                              title: 'Topic',
                            },
                            {
                              id: 'facts',
                              title: 'Facts',
                              description:
                                'Provide additional facts that will be used by the action',
                            },
                          ],
                        })
                        if (!inputResult) {
                          return // user closed the dialog
                        }

                        //use the result from each input
                        const [{result: topic}, {result: facts}] = inputResult
                        console.log(inputResult)
                      },
                    }),
                  ],
                }),
              ]
            }
            return [
              defineAssistFieldAction({
                title: 'Populate document about...',
                icon: UserIcon,
                onAction: async () => {
                  const input = await getUserInput({
                    title: 'Topic',
                    inputs: [{id: 'about', title: 'What should the article be about?'}],
                  })
                  if (!input) return // user canceled input

                  const topic = input[0].result
                  pushToast({
                    title: 'Preparing and outline',
                    description: 'This may take a while...',
                  })
                  const outline = await getApiClient(client).agent.action.prompt({
                    instruction: `
                        Create an detailed outline for a document about the following topic:
                        $topic
                        ---
                     `,
                    instructionParams: {topic},
                    temperature: 0.5,
                  })

                  console.log(outline)
                  pushToast({
                    title: 'Creating additional material',
                    description: 'This may take a while...',
                  })
                  const moreDetails = await getApiClient(client).agent.action.prompt({
                    instruction: `
                        Given the following outline:
                        $outline
                        ---
                        Create at least 2 paragraphs of text for each outline item (don't repeat the outline)
                     `,
                    instructionParams: {outline},
                    temperature: 0.5,
                  })
                  console.log(moreDetails)
                  await getApiClient(client).agent.action.generate({
                    schemaId,
                    targetDocument: {
                      operation: 'createIfNotExists',
                      _id: documentIdForAction,
                      _type: documentSchemaType.name,
                      initialValues: getDocumentValue(),
                    },
                    instruction: `
                        Given the following outline:
                        $outline.
                        ---
                        And these additional details:
                        $moreDetails
                        ---
                        Create a document about $topic.
                        Use the outline and additional material as inspiration, but write new text and structure
                        so it forms a coherent whole.

                        The text should read well and headings should not be generic.
                        Make the text engaging, the outline should NOT bleed into the content, it is only to here to show you the beats to include.
                        Make the document interesting and engaging.

                        Make the text come alive with plentiful use of images.
                        ---
                     `,
                    instructionParams: {topic, outline, moreDetails},
                    conditionalPaths: {paths: getConditionalPaths()},
                    target: {types: {exclude: ['reference']}, operation: 'set'},
                  })
                },
              }),
            ]
          }, [
            client,
            documentSchemaType,
            schemaId,
            getDocumentValue,
            getConditionalPaths,
            documentIdForAction,
            getUserInput,
            actionType,
            path,
            schemaType,
            pushToast,
          ])
        },
      },

      __customApiClient: getApiClient,

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

function getApiClient(defaultClient: SanityClient) {
  return pluginApiHost
    ? defaultClient.withConfig({
        apiHost: pluginApiHost,
        useProjectHostname: false,
        withCredentials: false,
      })
    : defaultClient
}

import {defineConfig} from 'sanity'
import {deskTool} from 'sanity/desk'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemas'
import {codeInput} from '@sanity/code-input'
import {pluginApiHost, dataset, projectId} from './env'
import {assist} from '../plugin/src'

console.log(pluginApiHost)

export default defineConfig({
  name: 'default',
  title: 'Sanity AI Assist',

  projectId,
  dataset,

  plugins: [
    deskTool(),
    visionTool(),
    codeInput(),
    assist({
      __customApiClient: (defaultClient) =>
        pluginApiHost
          ? defaultClient.withConfig({
              apiHost: pluginApiHost,
              useProjectHostname: false,
              withCredentials: false,
            })
          : defaultClient,
    }),
  ],
  schema: {
    types: schemaTypes,
  },
})

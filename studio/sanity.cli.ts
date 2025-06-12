import {defineCliConfig} from 'sanity/cli'
import {dataset, projectId, studioHost} from './env'

export default defineCliConfig({
  reactStrictMode: true,
  api: {
    projectId,
    dataset,
  },
  studioHost,
})

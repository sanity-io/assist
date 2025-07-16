import {defineCliConfig} from 'sanity/cli'
import {dataset, projectId, studioHost} from './env'

export default defineCliConfig({
  reactStrictMode: false,
  api: {
    projectId,
    dataset,
  },
  studioHost,
})

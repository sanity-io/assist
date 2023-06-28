import {defineCliConfig} from 'sanity/cli'
import {dataset, projectId} from './env'

export default defineCliConfig({
  reactStrictMode: true,
  api: {
    projectId,
    dataset,
  },
})

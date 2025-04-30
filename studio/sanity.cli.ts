import {defineCliConfig} from 'sanity/cli'
import {dataset, projectId} from './env'

export default defineCliConfig({
  reactStrictMode: true,
  api: {
    projectId,
    dataset,
  },
  studioHost: 'ai-assist-test-2',
})

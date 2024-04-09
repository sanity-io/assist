import {defineConfig} from 'vitest/config'

export default defineConfig({
  test: {
    server: {
      deps: {
        inline: ['sanity'],
      },
    },
  },

  optimizeDeps: {
    disabled: false,
  },
})

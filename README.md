## About Sanity AI Assist

Attach reusable AI instructions to fields and documents to supercharge your editorial workflow.

You create the instructions, Sanity AI Assist does the rest.

<img width="1019" alt="image" src="https://github.com/sanity-io/sanity/assets/835514/4d895477-c6d7-4da0-be25-c73e109edbdb">

The `@sanity/assist` package lives in the [plugin directory](./plugin). 

## Local development

To start the test studio run

```
npm run dev
```

or

```
SANITY_STUDIO_PROJECT_ID=<projectId> SANITY_STUDIO_DATASET=<dataset> npm run dev
```

The studio will hot-reload whenever the plugin code changes.

### Custom API host
To use a custom API host for the plugin, set `SANITY_STUDIO_PLUGIN_API_HOST` env variable.

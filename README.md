## About Sanity AI Assist

Free your team to do more of what they’re great at (and less busy work) with the AI assistant that works with structured content. Attach reusable AI instructions to fields and documents to supercharge your editorial workflow.

You create the instructions; Sanity AI Assist does the rest. [Learn more about writing instructions in the Sanity documentation](https://www.sanity.io/guides/getting-started-with-ai-assist-instructions?utm_source=github.com&utm_medium=organic_social&utm_campaign=ai-assist&utm_content=).

[Read the release announcement here.](https://www.sanity.io/blog/sanity-ai-assist-announcement?utm_source=github.com&utm_medium=organic_social&utm_campaign=ai-assist&utm_content=)

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

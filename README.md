## About Sanity AI Assist

Free your team to do more of what they’re great at (and less busy work) with the AI assistant that works with structured content. Attach reusable AI instructions to fields and documents to supercharge your editorial workflow.

You create the instructions; Sanity AI Assist does the rest. [Learn how to install, configure, and use AI Assist in the Sanity documentation][docs].

[Read the release announcement here.](https://www.sanity.io/blog/sanity-ai-assist-announcement?utm_source=github.com&utm_medium=organic_social&utm_campaign=ai-assist&utm_content=)


> Using this feature requires Sanity to send data to OpenAI.com for processing. It uses generative AI; you should verify the data before using it.

<img width="1019" alt="image" src="https://github.com/sanity-io/sanity/assets/835514/4d895477-c6d7-4da0-be25-c73e109edbdb">

The `@sanity/assist` package lives in the [plugin directory](./plugin). 

## Installation & usage

Follow [the instructions in the Sanity docs][docs].

## Third party sub-processors

This version of the feature uses OpenAI.com as a third-party sub-processor. Sanity's security team has vetted their security posture, and approved for use.

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

[docs]: https://www.sanity.io/docs/ai-assist?utm_source=github.com&utm_medium=organic_social&utm_campaign=ai-assist&utm_content=

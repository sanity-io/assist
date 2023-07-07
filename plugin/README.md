# @sanity/assist

> This is a **Sanity Studio v3** plugin.

## Table of contents

- [Table of contents](#table-of-contents)
- [About Sanity AI Assist](#about-sanity-ai-assist)
- [Installation](#installation)
- [Setup](#setup)
  - [Add the plugin](#add-the-plugin)
  - [Enabling the AI Assist API](#enabling-the-ai-assist-api)
- [Schema configuration](#schema-configuration)
  - [Disable AI Assist for a schema type](#disable-ai-assist-for-a-schema-type)
  - [Disable for a field](#disable-for-a-field)
  - [Disable for an array type](#disable-for-an-array-type)
  - [Unsupported types](#unsupported-types)
  - [Troubleshooting](#troubleshooting)
- [Included document types](#included-document-types)
- [License](#license)
- [Develop \& test](#develop--test)
  - [Release new version](#release-new-version)


## About Sanity AI Assist

Free your team to do more of what they’re great at (and less busy work) with the AI assistant that works with structured content. Attach reusable AI instructions to fields and documents to supercharge your editorial workflow.

You create the instructions; Sanity AI Assist does the rest. [Learn more about writing instructions in the Sanity documentation](https://www.sanity.io/guides/getting-started-with-ai-assist-instructions?utm_source=github.com&utm_medium=organic_social&utm_campaign=ai-assist&utm_content=).

[Read the release announcement here.](https://www.sanity.io/blog/sanity-ai-assist-announcement?utm_source=github.com&utm_medium=organic_social&utm_campaign=ai-assist&utm_content=)

<img width="1019" alt="Screenshot showing Sanity AI Assist instructions for a title field in the Sanity Studio document editor" src="https://github.com/sanity-io/sanity/assets/835514/4d895477-c6d7-4da0-be25-c73e109edbdb">

## Installation

In your Studio project folder, install the following plugin dependency:

```sh
npm install @sanity/assist sanity@latest
```

This plugin requires `sanity` version `3.13.0` or greater.

## Setup

> **Note:** Before using the plugin, your project must have Sanity AI Assist enabled at the API level.
>
> Contact your Sanity enterprise representative to get started, or [contact the sales team](https://www.sanity.io/contact/sales?utm_source=github.com&utm_medium=organic_social&utm_campaign=ai-assist&utm_content=).

### Add the plugin

In `sanity.config.ts`, add `assist` to the `plugins` array:

```tsx
import { assist } from '@sanity/assist'

export default defineConfig({
  /* other config */
  plugins: [
    /* other plugins */
    assist()
  ]
})
```

### Enabling the AI Assist API

After installing and adding the plugin and having the AI Assist feature enabled for your project and its datasets, you need to create a token for the plugin to access the AI Assist API. This needs to be done by a member of the project with token creation permissions (typically someone with an admin or developer role).

* Start the studio and open any document
* Click *the sparkle icon** (✨) in the document header near the close document X-button
* Then select **Manage instructions**

<img width="210" alt="The AI Assist document menu showing 'Manage instructions' highlighted" src="https://github.com/sanity-io/sanity/assets/835514/58c177ca-4530-4f44-abe0-4adcd9e11c8b">

* Selecting **Manage instructions** will open an inspector panel
* Click the **Enable AI assistance** button to create a token and enable AI Assist for everyone with access to the project

<img width="339" alt="The 'Enable Sanity AI Assist' button" src="https://github.com/sanity-io/sanity/assets/835514/38b81861-6a7c-49a2-a7c5-f46816d0c0a8">

You will find a new API token entry for your project named “Sanity AI” in your project's API settings on [sanity.io/manage](https://sanity.io/manage).

<img alt="The Sanity AI Assist API token entry on sanity.io/manage" src="https://github.com/sanity-io/sanity/assets/835514/3b2f549b-926c-4d85-b5fa-dd7f8f58e667" />

The plugin will now work for any dataset in your project.

**Note:** You can revoke this token at any time to disable Sanity AI Assist service. A new token has to be generated via the plugin UI for it to work again.

## Schema configuration

By default, most object, array, and string field types have AI writing assistance enabled. Your assistant can write to all compatible fields that it detects.

The assistant can also create array items, including Portable Text blocks, when the type has been imported to the Studio's schema as a custom type ([learn more about strict schemas](https://www.sanity.io/docs/graphql#33ec7103289a)).

### Disable AI Assist for a schema type

```tsx
// this will disable AI assistance wherever it is used,
// ie: as field, document, array types
defineType({
 name: 'policy',
  type: 'document',
  options: {
    aiWritingAssistance: {exclude: true}
 },
  fields: [
    // ...
  ]
})
```

### Disable for a field

```tsx
// this disables AI assistance only for the specific field
defineType({
 name: 'product',
  type: 'object',
  fields: [
    defineField({
      name: 'sku',
      type: 'string',
      options: {
        aiWritingAssistance: {exclude: true}
     }
  })
  ]
})
```

### Disable for an array type

```tsx
// this disables AI assistance for the specific array member
// if all types in the `of` array are excluded, the array type is also considered excluded
defineType({
 name: 'product',
  type: 'array',
  of: [
    defineArrayMember({
      type: 'customProduct',
      options: {
        aiWritingAssistance: {exclude: true}
     }
  })
  ]
})
```

### Unsupported types

The following types are not supported, and behave as excluded types:
* [Number](https://www.sanity.io/docs/number-type)
* [Reference](https://www.sanity.io/docs/reference-type)
* [Slug](https://www.sanity.io/docs/slug-type)
* [Url](https://www.sanity.io/docs/url-type)
* [Date](https://www.sanity.io/docs/date-type)
* [Datetime](https://www.sanity.io/docs/datetime-type)
* [Image](https://www.sanity.io/docs/image-type) (supported when image has custom fields)
* [File](https://www.sanity.io/docs/file-type) (never supported, even when file has custom fields)

Types and fields with `hidden` or `readonly` with a truthy value (`true` or `function`) are not supported.
(Hidden and readOnly fields can be referenced in instructions still)

Fields with these types will not be changed by the assistant, do not have AI Assist actions, and cannot be referenced in instructions.

Objects where all fields are excluded or unsupported and arrays where all member types are excluded or unsupported
will also be excluded.

### Troubleshooting

There are limits to how much text the AI can process when processing an instruction. Under the hood, the AI Assist will add information about your schema, which adds to what's commonly referred to as “the context window.”

If you have a very large schema (that is, many document and field types), it can be necessary to exclude types to limit how much of the context window is used for the schema itself.

We recommend excluding any and all types which rarely would benefit from automated workflows. A quick win is typically to exclude array types. It can be a good idea to exclude most non-block types from Portable Text arrays. This will ensure that the Sanity Assist outputs mostly formatted text.

## Included document types

This plugin adds an `AI Context` document type. 

If your Studio uses [Structure Builder](https://www.sanity.io/docs/structure-builder-introduction) to configure the studio structure,
you might have to add this document type to your structure.

The document type name can be imported from the plugin:
```ts
import {contextDocumentTypeName} from '@sanity/assist'

// put into structure in structure  
S.documentTypeListItem(contextDocumentTypeName)
```

## Caveats

Large Language Models (LLMs) are a new technology. Constraints and limitations are still being explored, 
but some common caveats to the field that you may run into using AI Assist are:

* Limits to instruction length: Long instructions on deep content structures may exhaust model context
* Timeouts: To be able to write structured content, we're using the largest language models - long-running results may time out or intermittently fail
* Limited capacity: The underlying LLM APIs used by AI Assist are resource constrained

## License

[MIT](LICENSE) © Sanity

## Develop & test

This plugin uses [@sanity/plugin-kit](https://github.com/sanity-io/plugin-kit)
with default configuration for build & watch scripts.

See [Testing a plugin in Sanity Studio](https://github.com/sanity-io/plugin-kit#testing-a-plugin-in-sanity-studio)
on how to run this plugin with hotreload in the studio.


### Release new version

Run ["CI & Release" workflow](https://github.com/sanity-io/sanity/actions/workflows/main.yml).
Make sure to select the main branch and check "Release new version".

Semantic release will only release on configured branches, so it is safe to run release on any branch.

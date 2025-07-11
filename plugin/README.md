# @sanity/assist

## Table of contents

- [Table of contents](#table-of-contents)
- [About Sanity AI Assist](#about-sanity-ai-assist)
- [Installation](#installation)
- [Setup](#setup)
  - [Add the plugin](#add-the-plugin)
  - [Enabling the AI Assist API](#enabling-the-ai-assist-api)
  - [Permissions](#permissions)
  - [Conditional user access](#conditional-user-access)
  - [Assist configuration](#assist-configuration-optional)
- [Schema configuration](#schema-configuration)
  - [Disable AI Assist for a schema type](#disable-ai-assist-for-a-schema-type)
  - [Disable for a field](#disable-for-a-field)
  - [Disable for an array type](#disable-for-an-array-type)
  - [Unsupported types](#unsupported-types)
  - [Date and datetime](#date-and-datetime)
  - [Hidden and readOnly fields](#hidden-and-readonly-fields)
  - [Reference support](#reference-support)
  - [Troubleshooting](#troubleshooting)
- [Included document types](#included-document-types)
- [Field and type filters](#field-and-type-filters)
- [Image description generation](#image-description-generation)
- [Image generation](#image-generation)
- [Full document translation](#full-document-translation)
  - [What it solves](#what-ai-assist-full-document-translations-solves)
  - [Configure](#configure-document-translations)
- [Field level translations](#field-level-translations)
  - [What it solves](#what-ai-assist-field-level-translations-solves)
  - [Configure](#configure-field-translations)
- [Adding translation actions to fields](#adding-translation-actions-to-fields)
- [Translation style guide](#translation-style-guide)
- [Custom field actions](#custom-field-actions)
  - [useExampleFieldActions](#usefieldaction)
  - [Define helpers](#define-helpers)
  - [useUserInput](#useuserinput)
- [License](#license)
- [Develop \& test](#develop--test)
  - [Release new version](#release-new-version)

## About Sanity AI Assist

Free your team to do more of what they’re great at (and less busywork) with the AI assistant that works with structured content. Attach reusable AI instructions to fields and documents to supercharge your editorial workflow.

You create the instructions; Sanity AI Assist does the rest. [Learn more about writing instructions in the Sanity documentation](https://www.sanity.io/docs/ai-assist?utm_source=github.com&utm_medium=organic_social&utm_campaign=ai-assist&utm_content=).

[Read the release announcement here.](https://www.sanity.io/blog/sanity-ai-assist-announcement?utm_source=github.com&utm_medium=organic_social&utm_campaign=ai-assist&utm_content=)

> Using this feature requires Sanity to send data to OpenAI.com for processing. It uses generative AI; you should verify the data before using it.

<img width="1019" alt="Screenshot showing Sanity AI Assist instructions for a title field in the Sanity Studio document editor" src="https://github.com/sanity-io/sanity/assets/835514/4d895477-c6d7-4da0-be25-c73e109edbdb">

## Installation

In your Studio project folder, install the following plugin dependency:

```sh
npm install @sanity/assist sanity@latest
```

This plugin requires `sanity` version `3.26` or greater.

## Setup

> **Note:** AI Assist is available for all projects on the Growth plan and up.

### Add the plugin

In `sanity.config.ts`, add `assist` to the `plugins` array:

```tsx
import {assist} from '@sanity/assist'

export default defineConfig({
  /* other config */
  plugins: [
    /* other plugins */
    assist(),
  ],
})
```

### Enabling the AI Assist API

After installing and adding the plugin and having the AI Assist feature enabled for your project and its datasets, you need to create a token for the plugin to access the AI Assist API. This needs to be done by a member of the project with token creation permissions (typically someone with an admin or developer role).

- Start the studio and open any document
- Click \*the sparkle icon\*\* (✨) in the document header near the close document X-button
- Then select **Manage instructions**

<img width="210" alt="The AI Assist document menu showing 'Manage instructions' highlighted" src="https://github.com/sanity-io/sanity/assets/835514/58c177ca-4530-4f44-abe0-4adcd9e11c8b">

- Selecting **Manage instructions** will open an inspector panel
- Click the **Enable AI assistance** button to create a token and enable AI Assist for everyone with access to the project

<img width="339" alt="The 'Enable Sanity AI Assist' button" src="https://github.com/sanity-io/sanity/assets/835514/38b81861-6a7c-49a2-a7c5-f46816d0c0a8">

You will find a new API token entry for your project named “Sanity AI” in your project's API settings on [sanity.io/manage](https://sanity.io/manage).

<img alt="The Sanity AI Assist API token entry on sanity.io/manage" src="https://github.com/sanity-io/sanity/assets/835514/3b2f549b-926c-4d85-b5fa-dd7f8f58e667" />

The plugin will now work for any dataset in your project.

**Note:** You can revoke this token at any time to disable Sanity AI Assist service. A new token has to be generated via the plugin UI for it to work again.

### Permissions

If your project is using custom roles (Enterprise), there are some additional considerations.

To see AI Assist presence when running instructions, users will need read access to
documents of `_type=="sanity.assist.task.status"`.

To edit instructions, users will need read and write access to documents of `_type=="sanity.assist.schemaType.annotations"`.

Note that instructions run using the permissions of the user invoking it, so only fields that the user
themselves can edit can be changed by the instruction instance.

### Conditional user access

To limit which users can see the AI Assist actions in the Studio, use a custom-plugin after `assist()`
that filters out the inspector and actions, based on user properties:

```ts
import {CurrentUser, defineConfig} from 'sanity'
import {assist} from '@sanity/assist'

export default defineConfig({
  // ...

  plugins: [
    // ...
    assist(),
    {
      name: 'disable-ai-assist',
      document: {
        inspectors: (prev, {currentUser}) =>
          isAiAssistAllowed(currentUser)
            ? prev
            : prev.filter((inspector) => inspector.name !== 'ai-assistance'),

        unstable_fieldActions: (prev, {currentUser}) =>
          isAiAssistAllowed(currentUser)
            ? prev
            : prev.filter((fieldActions) => fieldActions.name !== 'sanity-assist-actions'),
      },
    },
  ],
})

const ALLOWED_ROLES = ['administrator']

function isAiAssistAllowed(user?: CurrentUser | null) {
  return user && user.roles.some((role) => ALLOWED_ROLES.includes(role.name))
}
```

### Assist configuration (optional)

```ts
assist({
  // Showing default values
  assist: {
    localeSettings: () => Intl.DateTimeFormat().resolvedOptions(),
    maxPathDepth: 4,
    temperature: 0.3
  },
  translate: { /* see sections about document and field translation */}
})
```

- `localeSettings`: See section on [date and datetime](#date-and-datetime)
- `maxPathDepth`: The max depth for document paths AI Assist will write to.
- `temperature`: Influences how much the output of an instruction will vary between runs.

For more details, please review the TSDocs of the individual config parameters in [assistTypes.ts](./src/assistTypes.ts)

## Schema configuration

By default, most string, object, and array field types (including Portable Text!) have AI writing assistance enabled. Your assistant can write to all compatible fields that it detects.

### Disable AI Assist for a schema type

```tsx
// this will disable AI assistance wherever it is used,
// ie: as field, document, array types
defineType({
  name: 'policy',
  type: 'document',
  options: {
    aiAssist: {exclude: true},
  },
  fields: [
    // ...
  ],
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
        aiAssist: {exclude: true},
      },
    }),
  ],
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
        aiAssist: {exclude: true},
      },
    }),
  ],
})
```

### Unsupported types

The following types are not supported, and behave as excluded types:

- [Image](https://www.sanity.io/docs/image-type) (supported when image has custom fields)
- [File](https://www.sanity.io/docs/file-type) (never supported, even when file has custom fields)
- [Reference](https://www.sanity.io/docs/reference-type) (supported when configured with embeddingsIndex)

Fields with these types will not be changed by the assistant, do not have AI Assist actions, and cannot be referenced in instructions.

Objects where all fields are excluded or unsupported and arrays where all member types are excluded or unsupported
will also be excluded.

### Date and datetime
- [Date](https://www.sanity.io/docs/date-type)
- [Datetime](https://www.sanity.io/docs/datetime-type)

Starting from v3.0.0, AI Assist can write to date and datetime fields. Instructions can use language like "tomorrow at noon" or
"next year", and when Assist writes to the field, it will be converted to a field-compatible value.

Language about time is locale and timeZone dependant. By default instructions will use the locale and timezone provided
by the browser (`Intl.DateTimeFormat().resolvedOptions()`).

Alternatively, you can configure the plugin per user with an `assist.localeSettings` function that should return `LocaleSettings`.

##### Example
```ts
assist({
  assist: {
    localeSettings: ({currentUser, defaultSettings}) => {
      if (currentUser.roles.includes('admin')) {
        // forces locale and timeZone for admins
        return {
          locale: 'en-US',
          timeZone: 'America/New_York'
        }
      }
      // defaultSettings is the same as using:
      // const {locale, timeZone} = Intl.DateTimeFormat().resolvedOptions()
      return defaultSettings
    }
  }
})
```

For a list of allowed values for these parameters, see the following resources: 
- `locale`: [Mozilla on Intl](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl#getcanonicalocales)
- `timeZone`: [Wiki on time zones](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)

### Hidden and readOnly fields

In AI Assist 2.0 and later, conditionally `hidden` and `readOnly` fields can have instructions.
These fields can be written to by an instruction, as long as the field is non-hidden and writable when the instruction starts running.

Fields with `hidden` or `readOnly` set to literal `true` will be skipped by AI Assist.

_Note_: An instruction will not re-evaluate these states during a run.
I.e., if an instruction makes a change during its execution that triggers another field to change its `hidden` or `readOnly` status,
the running instruction will still consider these as if in their original state.

If it is essential that AI Assist _never_ writes to a conditional field,
it should be marked with `options.aiAssist.exclude: true`.

### Reference support

#### Create an Embeddings-index

To enable AI assist for references, first, your project must have an existing [embeddings-index](https://www.sanity.io/docs/embeddings-index-api-overview)
that includes the document types it should be able to reference.

You can manage your indexes directly in the studio using the [Embeddings Index Dashboard plugin](https://github.com/sanity-io/embeddings-index-ui#embeddings-index-api-dashboard-for-sanity-studio).

#### Set schema options

Set `options.aiAssist.embeddingsIndex` for reference fields/types you want to enable reference instructions for.
Reference fields with this option set can have instructions attached and will be visited when running instructions for object fields and arrays.

AI Assist will use the embeddings-index, further filtered by the types allowed by the reference, to look up contextually relevant references.
For arrays or portable text fields with references, one or more references can be added. Use the instruction text to control this.

Example:

```ts
import {defineArrayMember} from 'sanity'

defineField({
  type: 'reference',
  name: 'articleReference',
  title: 'Article reference',
  to: [{type: 'article'}],
  options: {
    aiAssist: {
      embeddingsIndex: 'article-index',
    },
  },
})
```

An example instruction attached to this field could be:
`Given <Document field: Title> suggest a related article`

Running it would use the `article-index` to find a related article based on the current document title.

### Troubleshooting

There are limits to how much text the assistant can handle when processing an instruction. Under the hood, AI Assist will add information about your schema, which adds to what's commonly referred to as “the context window.”

If you have a very large schema (that is, many document and field types), it can be necessary to exclude types to limit how much of the context window is used for the schema itself.

We recommend excluding any and all types that aren't likely to benefit from automated workflows. A quick win is typically to exclude array types. It can be a good idea to exclude most non-block types from Portable Text arrays. This will ensure that AI Assist outputs mostly formatted text.

It is also possible to exclude fields/types when creating an instruction. See [Field and type filters](#field-and-type-filters) for more.

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

## Field and type filters

When creating instructions for documents, object fields, array fields, or portable text fields, you can explicitly control what will be visited by AI Assist.
By default, the assistant will include all compatible fields and types.

Opting out fields/types per instruction is done using the respective field/type filter checkboxes under the instruction.
When using these filters, it is not necessary to tell AI Assist what to include in the instruction text itself.

Note that once the schema targeted by the instruction changes, the following behavior applies:

- instructions that include all fields or types will automatically also include the new fields or types
- instructions that have excluded one or more fields or types will NOT include the new fields or types

## Image description generation

AI Assist can optionally generate descriptions for images. This has to be enabled on an image-type/field,
by setting the `options.aiAssist.imageDescriptionField` on the image type, where `imageDescriptionField` is the field name of a
custom string-field on the image object:

```tsx
defineField({
  type: 'image',
  name: 'inlineImage',
  title: 'Image',
  fields: [
    defineField({
      type: 'string',
      name: 'altText',
      title: 'Alternative text',
    }),
  ],
  options: {
    aiAssist: {
      imageDescriptionField: 'altText',
    },
  },
})
```

This will add a **Generate image description** action to the configured field.
The **Generate image description** action will automatically run whenever the image changes.

`imageDescriptionField` can be a nested field, if the image has an object field, i.e. `imageDescriptionField: 'wrapper.altText'`.
Fields within array items are not supported.

By default, the caption field will regenerate whenever the image asset changes. To disable this behavior use the following configuration:
```ts
{
  imageDescriptionField: {
    path: 'wrapper.altText',
      updateOnImageChange: false
  }
}
```

## Image generation

<img width="600" alt="image" src="https://github.com/sanity-io/assist/assets/835514/c4de6791-f530-4cd1-b0c2-96ef988bc256">

AI Assist can generate assets for images configured with a prompt field.

An image is generated directly by using the **Generate image from prompt** instruction on the prompt field,
or indirectly whenever the image prompt field is written to by an AI Assist instruction.

### Configure

To enable image generation for an image field, the image must:

- set `options.aiAssist.imageInstructionField` to a child-path relative to the image
- have a `string` or `text` field that corresponds to the `imageInstructionField` path

This will add a **Generate image from prompt** instruction to the image prompt field. Running it will generate an image.

Additionally, whenever an AI Assist instruction writes to the image prompt field, the image will be re-generated.

This could be a document instruction, an instruction for the image field or parent object, or directly on the image prompt field.

A common style guide can achieved by adding an instruction to the image prompt field that rewrites its value to include instructions on common style rules.
Use AI context documents to apply a reusable style guide to the prompt rewriting as needed.

#### Example

Given the following document schema

```ts
defineType({
  type: 'document',
  name: 'article',
  fields: [
    defineField({
      type: 'image',
      name: 'articleImage',
      fields: [
        defineField({
          type: 'text',
          name: 'imagePrompt',
          title: 'Image prompt',
          rows: 2,
        }),
      ],
      options: {
        aiAssist: {
          imageInstructionField: 'imagePrompt',
        },
      },
    }),
  ],
})
```

To directly generate an image based on the value in the prompt field,
run the "Generate image from prompt" instruction that is automatically added.

For better image results or to ensure a consistent style, rewrite the prompt before generating the image:

### Example prompt expansion instruction

<img width="267" alt="image" src="https://github.com/sanity-io/assist/assets/835514/dabc6910-80d3-4a69-940f-49ac5cae9ade">

For better image results, use an instruction that expands the prompt to be more detailed.

Example instruction text:

```
Rewrite image prompts for image generation according to the following rules:
- Be Specific: Include detailed descriptions of the scene, objects, colors, and any characters. Instead of saying "a cat in a garden", say "a fluffy gray cat sitting beside pink tulips in a sunny garden".
- Set the Scene: Describe the environment or background. Mention if it's indoors or outdoors, the time of day, weather conditions, and any specific setting details like a beach, forest, cityscape, etc.
- Detail Characters: If your image includes people or animals, specify their appearance, clothing, poses, and expressions. For example, "a smiling young woman with short black hair, wearing a red dress, standing under a tree".
- Color and Style: Mention specific colors and artistic styles you prefer. For instance, "bright, vivid colors with a watercolor effect".
- Mood and Atmosphere: Describe the mood or atmosphere of the image. Words like 'peaceful', 'dynamic', 'mysterious', or 'joyful' can guide the AI in capturing the right tone.
- Avoid Ambiguity: Be clear and direct. Avoid using vague or abstract concepts that the AI might struggle to interpret.
- Follow the Guidelines: Ensure your prompt doesn't include any content against usage policies, such as depictions of real people, copyrighted characters, or sensitive subjects.

Keep it 100 words or less.

The prompt to rewrite is:
{Reference to image-prompt-field}
```

The rules can be extracted into an AI Context document and reused in other instructions as needed. This approach can also be used to inform a reusable styleguide for image generation.

## Full document translation

<img width="250" alt="Translate document action" src="https://github.com/sanity-io/assist/assets/835514/932968ee-1a8c-4389-8822-338188f88b40">

AI assist offers full document translations, which is ideal for pairing with [@sanity/document-internationalization](https://github.com/sanity-io/document-internationalization).

Translations are done deeply; visiting nested objects, arrays and even Portable text annotations.

### What AI Assist full document translations solves

Given a document written in one language, AI assist can translate the document in place to a language specified by a language field in the document.

When the document translation feature is enabled, AI Assist will go through the document field by field, translating all string and portable text fields into the language specified in the document's language field.

This works especially well with [@sanity/document-internationalization](https://github.com/sanity-io/document-internationalization), which uses a strategy of creating copies of the source document for each separate language to be translated into and uses a hidden string field to set the language for each copy.

AI Assist allows editors to translate these documents into the desired language immediately.

### Configure document translations

To enable full document translations, set `translate.document.languageField` to the path of the language field in your documents.

All documents with a corresponding language field will get a "Translate document" instruction added to the AI Assist drop-down for the document.

To further limit which document types should be enabled for translation instructions, provide an array of document type names to `translate.document.documentTypes`.

If the studio is using [@sanity/document-internationalization](https://github.com/sanity-io/document-internationalization), these options should be the same as those used for that plugin.

**Example configs**

```ts
// This will add a "Translate document" instruction to all documents with a language field
assist({
  translate: {
    document: {
      languageField: 'language',
    },
  },
})
```

```ts
// This will add a "Translate document" instruction only to the 'article' document type
assist({
  translate: {
    document: {
      languageField: 'language',
      documentTypes: ['article'],
    },
  },
})
```

**All configuration params**

```ts
assist({
    translate: {
        /** Config for document types with a single language field that determines the language for the whole document. */
        document: {
            /**
             * Required config, enable document tranlations.
             *
             * Path to language field in documents. Can be a hidden field.
             * For instance: 'config.language'
             *
             * For projects that use the `@sanity/document-internationalization` plugin,
             * this should be the same as `languageField` config for that plugin (which defaults to 'language')
             */
            languageField: string,

            /**
             * `documentTypes` should be an array of strings where each entry must match a name from your document schemas.
             *
             * this property will add a translate instruction to these document types if defined.
             * If undefined, the instruction will be added to all documents with aiAssistance enabled and a field matching `languageField` config.
             *
             * Documents with translation support will get a "Translate document>" instruction added.
             **/
            documentTypes: string[]
        }
    }
})
```

## Field level translations

<img width="250" alt="Translate fields action" src="https://github.com/sanity-io/assist/assets/835514/99819cd4-578e-43b2-8c70-8e39afff5f09">

<img width="250" alt="Translate fields dialog" src="https://github.com/sanity-io/assist/assets/835514/fe3d289c-49b6-46dd-ae2f-cd509a01534a">

AI assist offers field-level translations, which is ideal for use in conjunction with [sanity-plugin-internationalized-array](https://github.com/sanity-io/sanity-plugin-internationalized-array?tab=readme-ov-file#sanity-plugin-internationalized-array) and [@sanity/language-filter](https://github.com/sanity-io/language-filter)

### What AI Assist field-level translations solves

Given a document with field values in different languages, AI assist can transfer and translate from one language to the others.

The typical use case would be for documents that use internationalized wrapper types to hold values for multiple languages.

AI Assist supports complex values, so language fields that hold nested objects, portable text, or arrays will also be translated.

When initiating translations, editors select a language to translate from and which languages to translate to. This means that AI Assist supports partial translations in cases where editors are responsible for only some languages in the document.

### Configure field translations

To enable field-level translations, set `translate.field.documentTypes` to an array with which document types should get field translations, and `translate.field.languages`

```ts
assist({
  translate: {
    field: {
      documentTypes: ['article'],
      languages: [
        {id: 'en', title: 'English'},
        {id: 'de', title: 'German'},
      ],
    },
  },
})
```

These documents will get a **Translate fields** instruction added to the document AI Assist dropdown.

Out of the box, this is sufficient config for document types using the `internationalizedArray*` types provided by [sanity-plugin-internationalized-array](https://github.com/sanity-io/sanity-plugin-internationalized-array?tab=readme-ov-file#sanity-plugin-internationalized-array).

It will also work without further config for object types named `locale*`, (e.g. `localeTitle`, `localeDescription`) with one field per language:

_Example locale object supported by default_

```ts
// Object type with name starting with 'locale', and one field per language language
defineType({
  type: 'object',
  name: 'localeString',
  fields: [
    defineField({
      // these do not have to be string, could be any type
      type: 'string',
      name: 'en',
      title: 'English',
    }),
    defineField({
      type: 'string',
      name: 'de',
      title: 'German',
    }),
  ],
})
```

**If your schema is not using either of these structures**, refer to the section on [Custom language fields](#custom-language-fields).

#### Note on document schema depth
By default, field level translations will translate 6 "path-segments" deep.

Depth is based on field path segments like so:
- `title` has depth 1
- `array[_key="no"].title` has depth 3

If this is not sufficient for your document types, use `maxPathDepth`:

```ts
assist({
  translate: {
    field: {
      maxPathDepth: 12
    },
  },
})
```

Be careful not to set this too high in studios with recursive document schemas, as it could have negative impact on performance.
maxPathDepth is hard-capped to 50.

### Loading field languages

Languages must be an array of objects with an id and title.

```ts
assist({
  translate: {
    field: {
      languages: [
        {id: 'en', title: 'English'},
        {id: 'de', title: 'German'},
      ],
    },
  },
})
```

Or an asynchronous function that returns an array of objects with an id and title.

```ts
assist({
  translate: {
    field: {
      languages: async () => {
        const response = await fetch('https://example.com/languages')
        return response.json()
      },
    },
  },
})
```

The async function contains a configured Sanity client in the first parameter, allowing you to store language options as documents. Your query should return an array of objects with an id and title.

```ts
assist({
  translate: {
    field: {
      languages: async () => {
        const response = await client.fetch(`*[_type == "language"]{ id, title }`)
        return response
      },
    },
  },
})
```

Additionally, you can "pick" fields from a document, to pass into the query. For example, if you have a concept of "Markets" where only certain language fields are required in certain markets.

In this example, each language document has an array of strings called markets to declare where that language can be used. And the document being authored has a single market field.

```ts
assist({
  translate: {
    field: {
      selectLanguageParams: {
        market: 'market',
      },
      languages: async (client, {market = ``}) => {
        const response = await client.fetch(
          `*[_type == "language" && $market in markets]{ id, title }`,
          {market},
        )
        return response
      },
    },
  },
})
```

### Custom language fields

By providing a function to `translate.field.translationOutputs`, you have complete control over which fields belong to which language.

`translationOutputs` is used when an editor uses the **Translate fields** instruction.

It determines the relationships between document paths: Given a document path and a language, it should return the approriate sibling paths into which translations are output.

`translationOutputs` is invoked once per path in the document (limited to a depth of 6), with the following arguments:

- `documentMember` - the field or array item for a given path; contains the path and its `schemaType`
- `enclosingType` - the schema type of the parent holding the member
- `translateFromLanguageId` - the `languageId` for the language the users want to translate from
- `translateToLanguageIds` - all `languageId`s the user can translate to

The function should return a `TranslationOutput[]` array that contains all the paths where translations from `documentMember` (in the language received in `translateFromLanguageId`) should be output.

The function should return `undefined` for all document members that should not be directly translated, or are nested fields under a translated path.

#### Default function

The default `translationOutputs` is available using `import {defaultTranslationOutputs} from '@sanity/assist`.

#### Example

Given the following document:

```ts
{
	titles: {
		_type: 'languageObject',
		en: {
			_type: 'titleObject',
			title: 'Some title',
      subtitle: 'Some subtitle'
		},
		de: {
			_type: 'titleObject',
		}
	}
}
```

When translating from English to German, `translationOutputs` will be
invoked multiple times.

The following parameters will be the same every invocation:

- `translateFromLanguageId` will be `'en'`
- `translateToLanguageIds` will be `['de']`

`documentMember` and `enclosingType` will change between each invocation, and take the following values:

1. `{path: 'titles', name: 'titles', schemaType: ObjectSchemaType}`, `ObjectSchemaType`
2. `{path: 'titles.en', name: 'en', schemaType: ObjectSchemaType}`, `ObjectSchemaType`
3. `{path: 'titles.en.title', name: 'title', schemaType: StringSchemaType}`, `ObjectSchemaType`
4. `{path: 'titles.en.subtitle', name: 'subtitle', schemaType: StringSchemaType}`, `ObjectSchemaType`
5. `{path: 'titles.de', name: 'de', schemaType: ObjectSchemaType}`, `ObjectSchemaType`

To indicate that you want everything under `title.en` to be translated into `title.de`, `translationOutputs` needs to return `[id: 'de', outputPath: 'titles.de']` when invoked with `documentMember.path: 'titles.en'`.

The following function enables this:

```ts
function translationOutputs(
  member,
  enclosingType,
  translateFromLanguageId,
  translateToLanguageIds,
) {
  const parentIsLanguageWrapper =
    enclosingType.jsonType === 'object' && enclosingType.name.startsWith('language')

  if (parentIsLanguageWrapper && translateFromLanguageId === member.name) {
    // [id: 'de', ]
    return translateToLanguageIds.map((translateToId) => ({
      id: translateToId,
      // in this example, member.path is 'titles.en'
      // so this changes titles.en -> titles.de
      outputPath: [...member.path.slice(0, -1), translateToId],
    }))
  }

  // ignore other members
  return undefined
}
```

[### Full field translation configuration example]()

```ts
assist({
  translate: {
    field: {
      documentTypes: ['article'],
      selectLanguageParams: {market: 'market'},
      apiVersion: '2023-01-01',
      languages: (client, {market}) => {
        return client.fetch(`*[_type == "language" && $market in markets]{ id, title }`, {market})
      },
      translationOutputs: (member, enclosingType, fromLanguageId, toLanguageIds) => {
        // When the document member is named the same as fromLangagueId
        // and it is a field in a object with a name starting with "language"
        // then we return the paths to all other sibling language fields (and their langauge id)
        // It is ok that the member is an object, then all child fields will be translated
        if (
          translateFromLanguageId === member.name &&
          enclosingType.jsonType === 'object' &&
          enclosingType.name.startsWith('locale')
        ) {
          return translateToLanguageIds.map((translateToId) => ({
            id: translateToId,
            //changes path.to.en -> path.to.de (for instance)
            outputPath: [...member.path.slice(0, -1), translateToId],
          }))
        }
        // all other member paths are skipped
        return undefined
      },
    },
  },
})
```

## Adding translation actions to fields

<img width="250" alt="Translate action on field" src="https://github.com/sanity-io/assist/assets/835514/e6dc0860-90a7-4f7a-b3d2-71893b09862f">

<img width="250" alt="Translate fields action on field" src="https://github.com/sanity-io/assist/assets/835514/acc5fa23-2022-4eae-922d-5c83dda7379c">

By default, **Translate document** and **Translate fields…** instructions are only added to the top-level document instruction menu.

These instructions can also be added to fields by setting
`options.aiAssist.translateAction: true` for a field or type.

This allows editors to translate only parts of the document and can be useful to enable for `internationalizedArrays` or `locale` wrapper object types.

For document types configured for full document translations, a **Translate** action will be added. Running it will translate the field to the language set in the language field

For document types configured for field translations, a **Translate fields...** action will be added. Running it will open a dialog with language selectors.

#### Example

```ts
defineField({
  name: 'subtitle',
  type: 'internationalizedArrayString',
  title: 'Subtitle',
  options: {
    aiAssist: {
      translateAction: true,
    },
  },
})
```

## Translation style guide

In some cases you might want/need the translator to follow a certain style guide - for
instance you might tell it not to translate certain words, or be more formal or casual.
To configure this you can pass a `styleguide` property under the translation
configuration:

```ts
assist({
  translate: {
    styleguide: `Be extremely formal and precise. Translate as if you are Spock from Star Trek.`,
  },
})
```

The style guide is currently limited to 2000 characters, and the translation might get
slower the longer your style guide is. If the provided string is longer than the limit,
the plugin will throw upon studio startup.

Note that this is currently only available on a global level - it can not be defined
per-field for now.

### Dynamic styleguide

As of 4.1.0 it is also possible to provide a styleguide async function.
The function is passed a context object with Sanity client and the current documentId and schemaType. 

Consider caching the results: the function is invoked every time translate runs.

```ts
assist({
  translate: {
    styleguide: ({client, documentId, schemaType}) => client.fetch('* [_id=="styleguide.singleton"][0].styleguide')
  },
})
```

## Custom field actions

<img width="513" alt="Field action menu with custom actions" src="https://github.com/user-attachments/assets/c613f692-4983-4acc-a8c2-8fb60294682a" />

To incorporate [Agent Actions](https://www.sanity.io/docs/agent-actions?utm_source=github.com&utm_medium=organic_social&utm_campaign=ai-assist&utm_content=)
or other custom actions into the AI Assist document and field action menus, use `fieldActions` plugin config.

Because of react hook linting, we recommend defining the `useExampleFieldActions` outside the plugin config:

```ts
//sanity.config.ts
import {defineConfig} from 'sanity'
import {assist, type AssistFieldActionProps, defineAssistFieldAction} from '@sanity/assist'

function useExampleFieldActions(props: AssistFieldActionProps) {
  return useMemo(() => [
    defineAssistFieldAction({
      title: 'Do something',
      icon: ActionIcon,
      onAction: async () => {
        // perform an (async) action
        // errors will be caught and displayed in a toast
        // until the action completes or fails, AI Assist "presence" will show up on the top of the document
      },
    })], [])
}

export default defineConfig({
  //...
  plugins: [
    //...other plugins
    assist({
      fieldActions: {
        title: 'Custom actions',
        useExampleFieldActions
      }
    })
  ]
})
```

### `useExampleFieldActions`

`useExampleFieldActions` is called for the document itself and for all fields within it. It can call React hooks.
Actions returned by the hook will be added to the corresponding document or field menu.

It is recommended to wrap the returned actions in `useMemo`. The returned array can contain `undefined` values. 
These will be filtered out.


See TSDocs for [AssistFieldActionProps](./src/fieldActions/customFieldActions.tsx) for details on how each
prop can be used to parameterize Agent Actions on sanity client.

#### Agent Action examples

Below are some examples of agent action integration.
For more, see [HOW-TO-USE](../studio/examples/agentActions/HOW-TO-USE.md)

##### Fix spelling

The following example adds a "Fix spelling" action to all fields and the document itself.

It will fix spelling mistakes for the field it is invoked for (and all child fields, for arrays and objects),
by calling `client.agent.action.transform`.

```ts
function useExampleFieldActions(props: AssistFieldActionProps) {
  const {
    documentSchemaType,
    schemaId,
    getDocumentValue,
    getConditionalPaths,
    documentIdForAction,
    path,
  } = props
  const client = useClient({apiVersion: 'vX'})
  return useMemo(() => {
    return [
      defineAssistFieldAction({
        title: 'Fix spelling',
        icon: TranslateIcon,
        onAction: async () => {
          await client.agent.action.transform({
            schemaId,
            documentId: documentIdForAction,
            instruction: 'Fix any spelling mistakes',
            instructionParams: {field: {type: 'field', path}},
            // no need to send path for document actions
            target: path.length ? {path} : undefined,
            conditionalPaths: {paths: getConditionalPaths()},
          })
        },
      }),
    ]
  }, [
    client,
    documentSchemaType,
    schemaId,
    getDocumentValue,
    getConditionalPaths,
    documentIdForAction,
    path,
  ])
}
```

##### Fill field (contextually aware)

The following example adds a "Fill field" action to all fields in the document by calling `client.agent.action.generate`.

The action will:
- create the document as a draft if it does not exist, respecting initial values (`targetDocument`)
- use existing document state to determine what should be put in the the field (`instruction`, `instructionParams`)
- pass the current readOnly and hidden state currently use by the document form to the Agent Action, so it respects it (`conditionalPaths`)
- output to the field the action started from (`target.path`)

```ts
function useExampleFieldActions(props: AssistFieldActionProps) {
  const {
    documentSchemaType,
    actionType,
    schemaId,
    getDocumentValue,
    getConditionalPaths,
    documentIdForAction,
    path,
    schemaType,
  } = props

  // hook usage has to happen outside onAction, so preassemble state in useExampleFieldActions and pass to useMemo
  const client = useClient({apiVersion: 'vX'})

  return useMemo(() => {
    if (actionType === 'document') {
      // in this case we dont want a document action
      return []
    }

    return [
      defineAssistFieldAction({
        title: 'Fill field',
        icon: EditIcon,
        onAction: async () => {
          await client.agent.action.generate({
            schemaId,
            targetDocument: {
              operation: 'createIfNotExists',
              _id: documentIdForAction,
              _type: documentSchemaType.name,
              initialValues: getDocumentValue(),
            },
            instruction: `
                        We are generating a new value for a document field.
                        The document type is ${documentSchemaType.name}, and the document type title is ${documentSchemaType.title}
                        The document language is: "$lang" (use en-US if unspecified)
                        The document value is:
                        $doc
                        ---
                        We are in the following field:
                        JSON-path: ${pathToString(path)}
                        Title: ${schemaType.title}
                        Value: $field (consider it empty if undefined)
                        ---
                        Generate a new field value. The new value should be relevant to the document type and context.
                        Keep it interesting. Generate using the document language.
                     `,
            instructionParams: {
              doc: {type: 'document'},
              field: {type: 'field', path},
              lang: {type: 'field', path: ['language']},
            },
            target: {
              path,
            },
            conditionalPaths: {
              paths: getConditionalPaths(),
            },
          })
        },
      }),
    ]
  }, [
    client,
    documentSchemaType,
    schemaId,
    getDocumentValue,
    getConditionalPaths,
    documentIdForAction,
    actionType,
    path,
    schemaType,
  ])
}
```

### Define helpers

#### `defineAssistFieldAction`

Adds a single action that will appear in the document/field action menu.

`onAction` _cannot_ call hooks. If state from hook is needed, it should be pre-assembled by `useExampleFieldActions`

```ts
defineAssistFieldAction({
  title: 'Do something',
  icon: ActionIcon,
  onAction: async () => {
    //perform actions
  },
})
```

#### `defineAssistFieldActionGroup`

Adds a group to hold one or more actions (or nested groups).
`children` can contain `undefined` values. These will be filtered out.
A group that has an empty `children` array (or only undefined values) will be filtered out.

By default, any actions returned by `useExampleFieldActions` will be grouped under `title`.
```ts
function useExampleFieldActions(props: AssistFieldActionProps) {
  return [
    defineAssistFieldAction({/* ... */}), 
    defineAssistFieldActionGroup({
      title: 'More actions',
      children: [
        defineAssistFieldAction({/* ... */}),
      ],
    })
  ]
}
```

#### Only groups in `useExampleFieldActions`
If `useExampleFieldActions` _only_ returns groups, the default wrapper group will be omitted. This allows full control over each group title.

#### `defineFieldActionDivider`
Adds a divider between actions or groups. Takes no arguments:

```ts
function useExampleFieldActions(props: AssistFieldActionProps) {
  return useMemo(() => [
    defineAssistFieldAction({/* ... */}),
    defineFieldActionDivider(),
    defineAssistFieldAction({/* ... */}),
  ], [])
}
```

### `useUserInput`

<img width="522" alt="user input dialog" src="https://github.com/user-attachments/assets/86966468-9a28-4c0b-99f3-e4b80fdbe691" />

For certain actions, it is useful to have the user provide additional information or details that can be used
as parameters for the action.

`useUserInput` returns a `getUserInput` function that can be called and awaited to return input from the user.

The `getUserInput` function takes input configuration and will display an input dialog to the user.
When the user completes the dialog, the user inputted text will be available (or undefined if the user closed the dialog).


```ts

function useExampleFieldActions(props: AssistFieldActionProps) {
  const getUserInput = useUserInput()

  return useMemo(
    () => [
      defineAssistFieldAction({
        title: 'Do something with user input',
        onAction: async () => {
          const inputResult = await getUserInput({
            title: 'What do you want to do?', // dialog title
            inputs: [
              {
                id: 'topic',
                title: 'Topic',
              },
              {
                id: 'facts',
                title: 'Facts',
                description: 'Provide additional facts that will be used by the action',
              },
            ],
          })
          if (!inputResult) {
            return // user closed the dialog
          }

          //use the result from each input
          //const [{result: topic}, {result: facts}] = inputResult
        },
      }),
    ],
    [getUserInput],
  )
}
```

## Caveats

Large Language Models (LLMs) are a new technology. Constraints and limitations are still being explored,
but some common caveats to the field that you may run into using AI Assist are:

- Limits to instruction length: Long instructions on deep content structures may exhaust model context
- Timeouts: To be able to write structured content, we're using the largest language models - long-running results may time out or intermittently fail
- Limited capacity: The underlying LLM APIs used by AI Assist are resource-constrained

## Third party sub-processors

This version of the feature uses OpenAI.com as a third-party sub-processor. Their security posture has been vetted by Sanity's security team, and approved for use.

## License

[MIT](LICENSE) © Sanity

## Develop & test

This plugin uses [@sanity/plugin-kit](https://github.com/sanity-io/plugin-kit)
with default configuration for build & watch scripts.

See [Testing a plugin in Sanity Studio](https://github.com/sanity-io/plugin-kit#testing-a-plugin-in-sanity-studio)
on how to run this plugin with hotreload in the studio.

### Release new version

Run ["CI & Release" workflow](https://github.com/sanity-io/assist/actions/workflows/main.yml).
Make sure to select the main branch and check "Release new version".

Semantic release will only release on configured branches, so it is safe to run release on any branch.

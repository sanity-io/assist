# @sanity/assist

> This is a **Sanity Studio v3** plugin.

## Table of contents

- [Table of contents](#table-of-contents)
- [About Sanity AI Assist](#about-sanity-ai-assist)
- [Installation](#installation)
- [Setup](#setup)
  - [Add the plugin](#add-the-plugin)
  - [Enabling the AI Assist API](#enabling-the-ai-assist-api)
  - [Permissions](#permissions)
- [Schema configuration](#schema-configuration)
  - [Disable AI Assist for a schema type](#disable-ai-assist-for-a-schema-type)
  - [Disable for a field](#disable-for-a-field)
  - [Disable for an array type](#disable-for-an-array-type)
  - [Unsupported types](#unsupported-types)
  - [Hidden and readOnly fields](#hidden-and-readonly-fields)
  - [Reference support](#reference-support)
  - [Troubleshooting](#troubleshooting)
- [Included document types](#included-document-types)
- [Field and type filters](#field-and-type-filters)
- [Caption generation](#caption-generation)
- [Image generation](#image-generation)
- [Full document translation](#full-document-translation)
  - [What it solves](#what-ai-assist-full-document-translations-solves)
  - [Configure](#configure-document-translations)
- [Field level translations](#field-level-translations)
  - [What it solves](#what-ai-assist-field-level-translations-solves)
  - [Configure](#configure-field-translations)
- [Adding translation actions to fields](#adding-translation-actions-to-fields)
- [License](#license)
- [Develop \& test](#develop--test)
  - [Release new version](#release-new-version)


## About Sanity AI Assist

Free your team to do more of what they’re great at (and less busy work) with the AI assistant that works with structured content. Attach reusable AI instructions to fields and documents to supercharge your editorial workflow.

You create the instructions; Sanity AI Assist does the rest. [Learn more about writing instructions in the Sanity documentation](https://www.sanity.io/guides/getting-started-with-ai-assist-instructions?utm_source=github.com&utm_medium=organic_social&utm_campaign=ai-assist&utm_content=).

[Read the release announcement here.](https://www.sanity.io/blog/sanity-ai-assist-announcement?utm_source=github.com&utm_medium=organic_social&utm_campaign=ai-assist&utm_content=)

> Using this feature requires Sanity to send data to OpenAI.com for processing. It uses generative AI; you should verify the data before using it.

<img width="1019" alt="Screenshot showing Sanity AI Assist instructions for a title field in the Sanity Studio document editor" src="https://github.com/sanity-io/sanity/assets/835514/4d895477-c6d7-4da0-be25-c73e109edbdb">

## Installation

In your Studio project folder, install the following plugin dependency:

```sh
npm install @sanity/assist sanity@latest
```

This plugin requires `sanity` version `3.16.0` or greater.

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

### Permissions

If your project is using custom roles (Enterprise), there are some additional considerations.

To see AI Assist presence when running instructions, users will need read access to
documents of `_type=="sanity.assist.task.status"`.

To edit instructions, users will need read and write access to documents of `_type=="sanity.assist.schemaType.annotations"`.

Note that instructions run using the permissions of the user invoking it, so only fields that the user
themselves can edit can be changed by the instruction instance.

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
* [Slug](https://www.sanity.io/docs/slug-type)
* [Url](https://www.sanity.io/docs/url-type)
* [Date](https://www.sanity.io/docs/date-type)
* [Datetime](https://www.sanity.io/docs/datetime-type)
* [Image](https://www.sanity.io/docs/image-type) (supported when image has custom fields)
* [File](https://www.sanity.io/docs/file-type) (never supported, even when file has custom fields)
* [Reference](https://www.sanity.io/docs/reference-type) (supported when configured with embeddingsIndex)

Fields with these types will not be changed by the assistant, do not have AI Assist actions, and cannot be referenced in instructions.

Objects where all fields are excluded or unsupported and arrays where all member types are excluded or unsupported
will also be excluded.

### Hidden adn readOnly fields

In AI Assist 2.0 and later, conditionally `hidden` and `readOnly` fields can have instructions.
These fields can be written to by an instruction, as long as the field is non-hidden and writable when the instruction is started.

Fields with `hidden` or `readOnly` set to literal `true` will be skipped by AI Assist.

*Note*: An instruction will not re-evaluate these states during a run.
Ie, if an instructions writes to a field that will make another field in the studio readonly or hidden,
the running instruction will still consider these as if in their original state.

If it is essential that AI Assist *never* writes to a conditional field,
it should be marked with `options.aiWritingAssistance.exclude: true`.

### Reference support

#### Create an Embeddings-index
To enable AI assist for references, first, your project must have an existing [embeddings-index](https://www.sanity.io/docs/embeddings-index-api-overview)
with the documents it should be able to reference.

You can manage your indexes directly in the studio using the [Embeddings Index Dashboard plugin](https://github.com/sanity-io/embeddings-index-ui#embeddings-index-api-dashboard-for-sanity-studio).

#### Set schema options
Set `options.aiWritingAssistance.embeddingsIndex` for reference fields/types you want to enable reference instructions for. 
Reference fields with this options set can have instructions attached to them, and will be visited when running instructions for object fields and arrays.

AI assist will use the embeddings-index, filtered by the types allowed by the reference to look up contextually relevant references.
For arrays or portable text fields with references, one more references can be added. Use the instruction text to control this.

Example:

```ts
import {defineArrayMember} from 'sanity'

defineField({
  type: 'reference',
  name: 'articleReference',
  title: 'Article referene',
  to: [ { type: 'article'} ],
  options: {
    aiWritingAssistance: {
      embeddingsIndex: 'article-index'
    },
  },
})
```

An example instruction attached to this field could be:
`Given <Document field: Title> suggest a related article`

Running it would use the `article-index` to find an related article based on the current document title.

### Troubleshooting

There are limits to how much text the AI can process when processing an instruction. Under the hood, the AI Assist will add information about your schema, which adds to what's commonly referred to as “the context window.”

If you have a very large schema (that is, many document and field types), it can be necessary to exclude types to limit how much of the context window is used for the schema itself.

We recommend excluding any and all types which rarely would benefit from automated workflows. A quick win is typically to exclude array types. It can be a good idea to exclude most non-block types from Portable Text arrays. This will ensure that the Sanity Assist outputs mostly formatted text.

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

When creating instructions for a document, objects fields, array fields or portable text fields, you can explicitly control what will be visited by AI Assist.
By default, all fields and types configured for assist will be included. 

Opting out fields/types per instruction is done using the respective field/type filter checkboxes under the instruction.
When using these filters, it is not necessary to tell Assist what to include in the instruction text itself.  

Note that if the schema targeted by the instruction changes, the following behavior applies:
* instructions that included all fields or types will automatically also include the new fields or types
* instructions that have excluded one or more fields or types, will NOT include the new fields or types

## Caption generation
AI Assist can optionally generate captions for images. This has to be enabled on an image-type/field,
by setting the `options.captionField` on the image type, where `captionField` is the field name of a
custom string-field on the image object:

```tsx
defineField({
    type: 'image',
    name: 'inlineImage',
    title: 'Image',
    fields: [
      defineField({
        type: 'string',
        name: 'caption',
        title: 'Caption',
      }),
    ],
    options: {
      captionField: 'caption', 
    },
})
```
This will add a "Generate caption" action to the configured field.
"Generate caption" action will automatically run whenever the image changes.

`captionField` can be a nested field, if the image has object field, ie `captionField: 'wrapper.caption'`.
Fields within array items are not supported.

## Image generation
<img width="600" alt="image" src="https://github.com/sanity-io/assist/assets/835514/c4de6791-f530-4cd1-b0c2-96ef988bc256">

AI Assist can generate assets for images configured with a prompt field.

An image is generated directly by using the "Generate image from prompt" instruction on the prompt field, 
or indirectly whenever the image prompt field is written to by an AI Assist instruction.

### Configure
To enable image generation for an image field, the image must:
- set `options.imagePromptField` to a child-path relative to the image
- have a `string` or `text` field that corresponds to the `imagePromptField` path

This will add a "Generate image from prompt" instruction to the image prompt field. Running it will generate and image.

Additionally, whenever an AI Assist instruction writes to the image prompt field, the image will be generated.

This could be a document instruction, an instruction for the image field or parent object, or directly on the image prompt field.

A common styleguide can achieved by adding an instruction to the image prompt field that rewrites whatever value is there, to include a common style.
Use AI context documents to apply a reusable styleguide to the prompt rewriting as needed.

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
		    imagePromptField: 'imagePromptField',
		  },
		})
	] 
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

This works well with [@sanity/document-internationalization](https://github.com/sanity-io/document-internationalization), where documents are duplicated from a source language and set a hidden language field.

AI assist allows editors to translate these documents into the desired language immediately.

### Configure document translations

To enable full document translations, set `translate.document.languageField` to the path of the language field in your documents.

All documents with a language field will get a "Translate document" instruction added to the assist drop-down for the document.

To limit which document types get "Translate document" further, provide `translate.document.documentTypes` with an array of document type names.

If the studio is using [@sanity/document-internationalization](https://github.com/sanity-io/document-internationalization), these options should be the same as those used for that plugin.

**Example configs**

```ts
// This will add a "Translate document" instruction to all documents with a language field
assist({
    translate: {
        document: {
            languageField: 'language'
        }
    }
})
```

```ts
// This will add a "Translate document" instruction only to the 'article' document type
assist({
    translate: {
        document: {
            languageField: 'language',
            documentTypes: ['article']
        }
    }
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

AI assist offers field-level translations, which is ideal for using alongside with[sanity-plugin-internationalized-array](https://github.com/sanity-io/sanity-plugin-internationalized-array?tab=readme-ov-file#sanity-plugin-internationalized-array) and (@sanity/language-filter)[https://github.com/sanity-io/language-filter]

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
						{id: 'de', title: 'German'}
					]
        },
      },
 })
```

These documents will get a "Translate fields" instruction added to the document AI Assist dropdown.

Out of the box, this is sufficient config for document types using `internationalizedArray*` types for localization [sanity-plugin-internationalized-array](https://github.com/sanity-io/sanity-plugin-internationalized-array?tab=readme-ov-file#sanity-plugin-internationalized-array).

It will also work without further config for object types named "locale*", with one field per language:

*Example locale object supported by default*

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
			title: 'English'
		}),
		defineField({
			type: 'string',
      name: 'de',
			title: 'German'
		})
	]
})
```

**If your schema is not using either of these structures**, confer [Custom language fields](#custom-language-fields).

### Loading field languages
Languages must be an array of objects with an id and title.

```ts
assist({
      translate: {
        field: {
          languages: [
						{id: 'en', title: 'English'},
						{id: 'de', title: 'German'}
					]
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
					}
        },
      },
 })
```

The async function contains a configured Sanity Client in the first parameter, allowing you to store Language options as documents. Your query should return an array of objects with an id and title.


```ts
assist({
      translate: {
        field: {
          languages: async () => {
					    const response = await client.fetch(`*[_type == "language"]{ id, title }`)
						  return response
					}
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
					  market: 'market'
					},
					languages: async (client, {market = ``}) => {
					  const response = await client.fetch(
							`*[_type == "language" && $market in markets]{ id, title }`,
					    {market}
					  )
					  return response
					},
        },
      },
 })
```

### Custom language fields
By providing a function to `translate.field.translationOutputs`, complete control over which fields belong to which language is given.

`translationOutputs` is used when an editor uses the "Translate fields" instruction.

It determines the relationships between document paths: Given a document path and a language, it should return into which sibling paths translations are output.

`translationOutputs` is invoked once per path in the document (limited to a depth of 6), with the following:

* `documentMember` - the field or array item for a given path; contains the path and its schemaType,
* `enclosingType` - the schema type of the parent holding the member
* `translateFromLanguageId` - the languageId for the language the users want to to translate from
* `translateToLanguageIds` - all languageIds the user can translate to

The function should return a `TranslationOutput[]` array that contains all the paths where translations from `documentMember` (in the language given by translateFromLanguageId) should be output.

The function should return `undefined` for all documentMembers that should not be directly translated, or are nested fields under a translated path.

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

* `translateFromLanguageId` will be `'en'`
* `translateToLanguageIds` will be `['de']`

`documentMember` and `enclosingType` will change between each invocation, and take the following values:

1. `{path: 'titles', name: 'titles', schemaType: ObjectSchemaType}`, `ObjectSchemaType`
2. `{path: 'titles.en', name: 'en', schemaType: ObjectSchemaType}`, `ObjectSchemaType`
3. `{path: 'titles.en.title', name: 'title', schemaType: StringSchemaType}`, `ObjectSchemaType`
4. `{path: 'titles.en.subtitle', name: 'subtitle', schemaType: StringSchemaType}`, `ObjectSchemaType`
5. `{path: 'titles.de', name: 'de', schemaType: ObjectSchemaType}`, `ObjectSchemaType`

To indicate that you want everything under `title.en` to be translated into `title.de`, `translationOutputs` needs to return [id: 'de', outputPath: 'titles.de'] when invoked with `documentMember.path: 'titles.en'`.

The following function enables this:

```ts
function translationOutputs(member, enclosingType, translateFromLanguageId, translateToLanguageIds) {
  const parentIsLanguageWrapper = enclosingType.jsonType === 'object' && enclosingType.name.startsWith('language')

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

### Full field translation configuration example

```ts
assist({
      translate: {
        field: {
          documentTypes: ['article'],
          selectLanguageParams: {market: 'market'},
					apiVersion: '2023-01-01',
					languages: (client, {market}) => {
            return client.fetch(
								`*[_type == "language" && $market in markets]{ id, title }`,
							  {market}
					  )
          },
					translationOutputs: (member, enclosingType, fromLanguageId, toLanguageIds) => {
					   // When the document member is named the same as fromLangagueId
             // and it is a field in a object with a name starting with "language"
             // then we return the paths to all other sibling language fields (and their langauge id)
						// It is ok that the member is an object, then all child fields will be translated
							if (translateFromLanguageId === member.name && enclosingType.jsonType === 'object' && enclosingType.name.startsWith('locale')) {
					      return translateToLanguageIds.map((translateToId) => ({
					         id: translateToId,
									 	//changes path.to.en -> path.to.de (for instance)
					         outputPath: [...member.path.slice(0, -1), translateToId],
					   }))
					   }
						// all other member paths are skipped
				   return undefined
				 }
        },
      },
 })
```

## Adding translation actions to fields

<img width="250" alt="Translate action on field" src="https://github.com/sanity-io/assist/assets/835514/e6dc0860-90a7-4f7a-b3d2-71893b09862f">

<img width="250" alt="Translate fields action on field" src="https://github.com/sanity-io/assist/assets/835514/acc5fa23-2022-4eae-922d-5c83dda7379c">

By default, “Translate document” and “Translate fields…” instructions are only added to the document instruction dropdown.

These instructions can also be added to fields by setting
`options.aiWritingAssistance.translateAction: true` for a field or type.

This allows editors to translate only parts of the document, and can be useful to enable on `internatinalizedArrays` or `locale` wrapper object types.

For document types configured for full document translations, a "Translate" action will be added. Running it will translate the field to the language set in the language field

For document types configured for field translations, a "Translate fields..." action will be added. Running it will open a dialog with language selectors.


#### Example

```ts
defineField({
    name: 'subtitle',
    type: 'internationalizedArrayString',
    title: 'Subtitle',
    options: {
        aiWritingAssistance: {
            translateAction: true
        }
    },
})
```

## Caveats

Large Language Models (LLMs) are a new technology. Constraints and limitations are still being explored, 
but some common caveats to the field that you may run into using AI Assist are:

* Limits to instruction length: Long instructions on deep content structures may exhaust model context
* Timeouts: To be able to write structured content, we're using the largest language models - long-running results may time out or intermittently fail
* Limited capacity: The underlying LLM APIs used by AI Assist are resource constrained


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

Run ["CI & Release" workflow](https://github.com/sanity-io/sanity/actions/workflows/main.yml).
Make sure to select the main branch and check "Release new version".

Semantic release will only release on configured branches, so it is safe to run release on any branch.

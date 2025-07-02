## Agent Actions

AI Assist can be integrated with `@sanity/client` [Agent Actions](https://www.sanity.io/docs/agent-actions?ref=agent-actions).
using AI Assist [custom field actions](../../../plugin/README.md#custom-field-actions).

This directory contains copy-pastable examples of individual field action hooks that can be used with
when implementing `fieldActions.useFieldActions`.

[useExampleFieldActions](useExampleFieldActions.ts) shows how all the examples can be combined into groups. The function can be used
directly as config function for `fieldActions.useFieldActions`.

### How to use a single example

See the TSDocs of each example action.

### Field action directory

- [Generate](https://github.com/sanity-io/client?tab=readme-ov-file#generating-content) examples
  - [Auto fill field](generate/autoFill.ts) – Contextually fill a document, object, array or field based on what is already in the document.
  - [Fill document based on user input](generate/fillDocumentFromInput.ts) – uses `useUserInput` to populate a document
  - [Generate image based on user input](generate/generateImageFromInput.ts) – uses `useUserInput` to get the image description
  - [Summarize document](generate/summarizeDocument.ts) – summarizes the current document in a format contextually relevant to the current field
- [Transform](https://github.com/sanity-io/client?tab=readme-ov-file#transforming-documents) examples
  - [Fix spelling](transform/fixSpelling.ts) – Fixes spelling on the current field (and any nested fields / array items)
  - [Image description (configure by field name)](transform/imageDescriptionWithFieldName.ts) – Adds a image description action to image fields with `alt` or `description` in their field name.
  - [Image description (configure by options)](transform/imageDescriptionWithOptions.ts) – Adds a image description action to fields with `options.addImageDescriptionAction`.
  - [Replace words or phrases](transform/replacePhrase.ts) – Replace words or phrases on the current document or field (and any nested fields / array items)
  - [Transform image](transform/transformImage.ts) – uses `useUserInput` to get how the image should be transformed
- [Translate](https://github.com/sanity-io/client?tab=readme-ov-file#translating-documents) examples
  - [Translate to any language](translate/translateToAny.ts) – uses `useUserInput` to get the language to translate to
- [Prompt](https://github.com/sanity-io/client?tab=readme-ov-file#prompt-the-llm) examples
  - [Answer question](prompt/answerQuestion.tsx) – document action where the user can ask questions about the document
  - [Infer action](prompt/inferAction.ts) – uses `useUserImput` to get a prompt to run, infers which action to run (generate or transform) and then runs it

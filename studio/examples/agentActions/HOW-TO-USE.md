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
  - [Summarize document](generate/generateImageFromInput.ts) – adds an action to field name containing summary or description that will populate it with a document summary
- [Transform](https://github.com/sanity-io/client?tab=readme-ov-file#transforming-documents) examples
  - [Fix spelling](transform/fixSpelling.ts) – Fixes spelling on the field (and sub fields / array items) it is invoked for
  - [Image description](transform/imageDescription.ts) – Adds a image description action to fields with `options.imageDescription`. See examples for config details.
  - [Replace words or phrases](transform/replacePhrase.ts) – Fixes spelling on the field (and sub fields / array items) it is invoked for
  - [Transform image](transform/fixSpelling.ts) – uses `useUserInput` to get how the image should be transformed
- [Translate](https://github.com/sanity-io/client?tab=readme-ov-file#translating-documents) examples
  - [Translate to any language](translate/translateToAny.ts) – uses `useUserInput` to get language to translate to
- [Prompt](https://github.com/sanity-io/client?tab=readme-ov-file#prompt-the-llm) examples
  - [Answer question](prompt/answerQuestion.tsx) – document action where the user can ask questions about the document
  - [Infer action](prompt/inferAction.ts) – exemplifies how to use prompt to infer user intent, then run a customized action based it

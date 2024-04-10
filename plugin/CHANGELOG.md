<!-- markdownlint-disable --><!-- textlint-disable -->

# 📓 Changelog

All notable changes to this project will be documented in this file. See
[Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [3.0.2](https://github.com/sanity-io/assist/compare/v3.0.1...v3.0.2) (2024-04-10)

### Bug Fixes

- **deps:** Update non-major ([#41](https://github.com/sanity-io/assist/issues/41)) ([2b35690](https://github.com/sanity-io/assist/commit/2b356908d327a594ce867ed1b28c6feff90df93f))
- use `lodash-es` in ESM bundles ([336134a](https://github.com/sanity-io/assist/commit/336134a33a7240205a289436df113ed5e0c25aec))

## [3.0.1](https://github.com/sanity-io/assist/compare/v3.0.0...v3.0.1) (2024-04-09)

### Bug Fixes

- `formatDistanceToNow` has moved ([81b77ce](https://github.com/sanity-io/assist/commit/81b77ce1fe5a1e7ce713eec8b0f4be54f002dc9b))
- **deps:** Update dependency @sanity/document-internationalization to v3 ([#42](https://github.com/sanity-io/assist/issues/42)) ([9ad8bd8](https://github.com/sanity-io/assist/commit/9ad8bd80c38a32b334e81cb97ad14d72d0a65212))

## [3.0.0](https://github.com/sanity-io/assist/compare/v2.0.5...v3.0.0) (2024-04-09)

### ⚠ BREAKING CHANGES

- add strict ESM support (#40)

### Features

- add strict ESM support ([#40](https://github.com/sanity-io/assist/issues/40)) ([cb427da](https://github.com/sanity-io/assist/commit/cb427da15eb6386cc45d692ce0d72c1112aae49e))

## [2.0.5](https://github.com/sanity-io/assist/compare/v2.0.4...v2.0.5) (2024-04-09)

### Bug Fixes

- add provenance ([02f5265](https://github.com/sanity-io/assist/commit/02f5265f742c88c124b1b36bc3dbc3c1efa366e7))
- **deps:** update dependency @sanity/language-filter to v4 ([#37](https://github.com/sanity-io/assist/issues/37)) ([5c10edc](https://github.com/sanity-io/assist/commit/5c10edc3226317a3e06e94e00f3eab183d4e8d4a))
- **deps:** update dependency sanity-plugin-internationalized-array to v2 ([#38](https://github.com/sanity-io/assist/issues/38)) ([2c8d4ae](https://github.com/sanity-io/assist/commit/2c8d4ae527ffa4cfbc855c85acc5e77b331d1822))

## [2.0.4](https://github.com/sanity-io/assist/compare/v2.0.3...v2.0.4) (2024-03-14)

### Bug Fixes

- add support for `sanity graphql deploy` ([83777b5](https://github.com/sanity-io/assist/commit/83777b5b2950d49ea62623f27a254e059397c059))

## [2.0.3](https://github.com/sanity-io/assist/compare/v2.0.2...v2.0.3) (2024-03-12)

### Bug Fixes

- image description is no longer regenerated when switching between old revisions ([24f3e58](https://github.com/sanity-io/assist/commit/24f3e5809015c02f5e2952e2a1080efa5fed8dda))

## [2.0.2](https://github.com/sanity-io/assist/compare/v2.0.1...v2.0.2) (2024-03-11)

### Bug Fixes

- image caption should no longer trigger automatically just after enabling the plugin ([79c3d46](https://github.com/sanity-io/assist/commit/79c3d462461de2bbc5b59154e978597773ef52ed))

## [2.0.1](https://github.com/sanity-io/assist/compare/v2.0.0...v2.0.1) (2024-03-05)

### Bug Fixes

- generate caption no longer runs if the plugin has yet to be initialized ([1e1ca6c](https://github.com/sanity-io/assist/commit/1e1ca6cea789e4e519d7eed4f4b951165b1039f5))

## [2.0.0](https://github.com/sanity-io/assist/compare/v1.2.16...v2.0.0) (2024-02-13)

### ⚠ BREAKING CHANGES

- all AI Assist schema options now live under options.aiAssist:
- options.aiWritingAssistance.exclude -> options.aiAssist.exclude
- options.aiWritingAssistance.embeddingsIndex -> options.aiAssist.embeddingsIndex
- options.aiWritingAssistance.translateAction -> options.aiAssist.translateAction
- options.imagePromptField -> options.aiAssist.imageInstructionField
- options.captionField -> options.aiAssist.imageDescriptionField

If you where using any of these, please update your schema definitions.

- minimum sanity version is now 3.26
- conditionally hidden and read-only types are now supported. See README for details.
- removed migration code has no impact when upgrading from 1.x version of the plugin
- to enable translation features, please consult the README.

### Features

- adds support for adding translation actions to fields via options ([eb1fe04](https://github.com/sanity-io/assist/commit/eb1fe0497281ccc859ced252fe602f3c46ef4f56))
- adds support for generating images based on image prompt field ([158cebb](https://github.com/sanity-io/assist/commit/158cebb5c686f0ef1d23cefa6719523f3f2ac8ba))
- assist support for references with aiWritingAssistance.embeddingsIndex option ([8124e53](https://github.com/sanity-io/assist/commit/8124e537b1c18835d5fbceb3ff7426681ade242c))
- instructions can now explicitly filter which types and fields can be used ([314f5bf](https://github.com/sanity-io/assist/commit/314f5bff21fa30a322e4ce96a8ab9033dc907a46))
- schema options moved from options.aiWritingAssistance to options.aiAssist ([4902df9](https://github.com/sanity-io/assist/commit/4902df9b28eb676fd36674fb8a8bef759c8ca0b3))
- stores selected languages for field translations per language ([4f9a00b](https://github.com/sanity-io/assist/commit/4f9a00b915d2b5b2e135e6c0ea54e4b9f18f8936))
- stores selected languages for field translations per language ([1c3eb44](https://github.com/sanity-io/assist/commit/1c3eb44335d45ac82ef252cc0d40049b097c35ac))
- support for conditional hidden and readonly schema types ([9af0173](https://github.com/sanity-io/assist/commit/9af017339430aae326da9b5cd421e11e07ad0766))
- translation instructions for documents and fields ([c699f1a](https://github.com/sanity-io/assist/commit/c699f1ac8b4f9389beae7491551bf333d3b0db25))
- translation support for pte annotations and inline objects ([a578eb3](https://github.com/sanity-io/assist/commit/a578eb364b3db61f33f6ed207443d673919384af))

### Bug Fixes

- always show generate image instruction when enabled ([740c1bf](https://github.com/sanity-io/assist/commit/740c1bfb42e697e2c5b6eb7da4403d1fdfda5101))
- disables translate action when assist is uninitialized ([254e512](https://github.com/sanity-io/assist/commit/254e512927b6de9134fb13cfad2eadfd0534f6d0))
- ensures that document is draft when starting translation instructions ([cd660ae](https://github.com/sanity-io/assist/commit/cd660aef24883c1b24c1d38a7e9fda8cc30f3351))
- field filter is now called allowed fields ([a293760](https://github.com/sanity-io/assist/commit/a293760d89b2b659be74ab516b32acb2502463f0))
- field language maps updates correctly when toggling languages ([18a0a78](https://github.com/sanity-io/assist/commit/18a0a780cf5e7f9e9d2fdc84a125f3c1d7d20bc9))
- improved translate fields dialog interactions ([b7dd790](https://github.com/sanity-io/assist/commit/b7dd790b539db671131d8fb03dca05cdb3a23fcc))
- instruction blocks are now non-collapsed for the default inspector width ([3387ef8](https://github.com/sanity-io/assist/commit/3387ef847a8b0ca0f512cf91609f43f8c3b593c5))
- missing \_type in array items no longer disable field translations ([ce3a466](https://github.com/sanity-io/assist/commit/ce3a466f9458d02e000d9a084b8359463717a253))
- only a single ai presence icon is now shown per field ([1078035](https://github.com/sanity-io/assist/commit/107803502d2aa6e5915047105077e00a79877449))
- removed code for migrating from alpha version of plugin ([a7f6c63](https://github.com/sanity-io/assist/commit/a7f6c63c47c958e5ce4f77e439424066d0a5623e))
- removed unused validation state from assist document ([fca2f5b](https://github.com/sanity-io/assist/commit/fca2f5b974813c4f022d70997ac2931151855140))

## [1.2.16](https://github.com/sanity-io/assist/compare/v1.2.15...v1.2.16) (2023-12-20)

### Bug Fixes

- support for sanity 3.23 ([8d971df](https://github.com/sanity-io/assist/commit/8d971dfc06aaaf0d441f8705ed22e94023836ffe))

## [1.2.15](https://github.com/sanity-io/assist/compare/v1.2.14...v1.2.15) (2023-11-16)

### Bug Fixes

- **deps:** Update dependency styled-components to v6 ([#12](https://github.com/sanity-io/assist/issues/12)) ([dbff139](https://github.com/sanity-io/assist/commit/dbff1398162084527b10fffbee2de9c7972c6e29))

## [1.2.14](https://github.com/sanity-io/assist/compare/v1.2.13...v1.2.14) (2023-11-16)

### Bug Fixes

- instructions on fields with explicit exclude: false no longer fails with an error ([4fd892e](https://github.com/sanity-io/assist/commit/4fd892ec146afb71161f047ed95129cfc43d0246))

## [1.2.13](https://github.com/sanity-io/assist/compare/v1.2.12...v1.2.13) (2023-11-06)

### Bug Fixes

- remove comments from instruction fields ([d1b8284](https://github.com/sanity-io/assist/commit/d1b8284ff8899c30c7385e3a546db057311dd0e1))

## [1.2.12](https://github.com/sanity-io/assist/compare/v1.2.11...v1.2.12) (2023-11-02)

### Bug Fixes

- inline block now correctly renders in Firefox ([d05060c](https://github.com/sanity-io/assist/commit/d05060c94fa37f2b18cea4e6172dcc20d733716a))

## [1.2.11](https://github.com/sanity-io/assist/compare/v1.2.10...v1.2.11) (2023-10-27)

### Bug Fixes

- image caption will now wait for document to sync before starting generation ([a70a425](https://github.com/sanity-io/assist/commit/a70a425f9bf15997034aa136cd6d9642f00758a7))

## [1.2.10](https://github.com/sanity-io/assist/compare/v1.2.9...v1.2.10) (2023-10-25)

### Bug Fixes

- field reference autocomplete should no longer include illegal fields ([e4849db](https://github.com/sanity-io/assist/commit/e4849db93f4ca7c3fab539e883b1acfe7692c233))

## [1.2.9](https://github.com/sanity-io/assist/compare/v1.2.8...v1.2.9) (2023-10-12)

### Bug Fixes

- unstable_languageFilter should no longer crash when processing unknown schemaType ([a1eb2f9](https://github.com/sanity-io/assist/commit/a1eb2f94f1d5fc0d34b204810c013a425f364d5b))

## [1.2.8](https://github.com/sanity-io/assist/compare/v1.2.7...v1.2.8) (2023-10-11)

### Bug Fixes

- aiWritingAssistance.exclude: true should disable document schema assist actions for all fields ([2571be6](https://github.com/sanity-io/assist/commit/2571be6b8ae26140fc02c7b519840ad63cc343c9))

## [1.2.7](https://github.com/sanity-io/assist/compare/v1.2.6...v1.2.7) (2023-10-11)

### Bug Fixes

- don't try to serialize list values if list is not an array ([#11](https://github.com/sanity-io/assist/issues/11)) ([e135df4](https://github.com/sanity-io/assist/commit/e135df410daa4d21e36a2fa24c867faa9dadca1c))

## [1.2.6](https://github.com/sanity-io/assist/compare/v1.2.5...v1.2.6) (2023-10-10)

### Bug Fixes

- support `next` ([#9](https://github.com/sanity-io/assist/issues/9)) ([7d98767](https://github.com/sanity-io/assist/commit/7d987671a51dd550278d245e904900c9fb419088))

## [1.2.5](https://github.com/sanity-io/assist/compare/v1.2.4...v1.2.5) (2023-10-05)

### Bug Fixes

- **docs:** captionField now supports field paths with . separator ([cf7d85b](https://github.com/sanity-io/assist/commit/cf7d85b5a4d16eba639c3b7dd53a521118a12eb6))

## [1.2.4](https://github.com/sanity-io/assist/compare/v1.2.3...v1.2.4) (2023-10-04)

### Bug Fixes

- list options for string-arrays should now be respected when generating values ([4701ea6](https://github.com/sanity-io/assist/commit/4701ea625b5f216f2c37d7c453b79ebde1eac63c))

## [1.2.3](https://github.com/sanity-io/assist/compare/v1.2.2...v1.2.3) (2023-10-04)

### Bug Fixes

- users without project/read grant should now be able to run instructions ([bce959d](https://github.com/sanity-io/assist/commit/bce959d415841c7423ff134ecef5e8a83675421a))

## [1.2.2](https://github.com/sanity-io/assist/compare/v1.2.1...v1.2.2) (2023-10-04)

### Bug Fixes

- support schema used by assist should no longer appear in structure or document lists ([0451ceb](https://github.com/sanity-io/assist/commit/0451ceb646a8283a495d26b9cfcda3f6130dc7ca))

## [1.2.1](https://github.com/sanity-io/assist/compare/v1.2.0...v1.2.1) (2023-09-28)

### Bug Fixes

- **regression:** avoid bundling `@sanity/mutator` ([ee6c2e9](https://github.com/sanity-io/assist/commit/ee6c2e98145570609f50b2d8a80b2624075a6248))

## [1.2.0](https://github.com/sanity-io/assist/compare/v1.1.4...v1.2.0) (2023-09-19)

### Features

- instructions can now be added to fields within array items ([347a3c7](https://github.com/sanity-io/assist/commit/347a3c78e69c86aaea213d8bfd22e17029308109))

## [1.1.4](https://github.com/sanity-io/assist/compare/v1.1.3...v1.1.4) (2023-09-14)

### Bug Fixes

- **docs:** added note about openai.io for processing ([b8258df](https://github.com/sanity-io/assist/commit/b8258df2df02dc023bded238efc5bb54995a564b))

## [1.1.3](https://github.com/sanity-io/assist/compare/v1.1.2...v1.1.3) (2023-08-31)

### Bug Fixes

- **docs:** added note about OpenAI as a third-party sub-processor ([2cb5fbc](https://github.com/sanity-io/assist/commit/2cb5fbcdc8f6d9494058b0147e5ebc106abee5c9))

## [1.1.2](https://github.com/sanity-io/assist/compare/v1.1.1...v1.1.2) (2023-08-31)

### Bug Fixes

- upgrade to latest field action API on sanity 3.16+ ([9afeffe](https://github.com/sanity-io/assist/commit/9afeffe384bfff2242e5ea9a83d02992ed5851ab))

## [1.1.1](https://github.com/sanity-io/assist/compare/v1.1.0...v1.1.1) (2023-08-18)

### Bug Fixes

- show generate caption action when configured also for array items ([e9ad41a](https://github.com/sanity-io/assist/commit/e9ad41a55bb107fc7905937575d64f6d259c217c))

## [1.1.0](https://github.com/sanity-io/assist/compare/v1.0.12...v1.1.0) (2023-08-18)

### Features

- caption generation action ([d675536](https://github.com/sanity-io/assist/commit/d67553611c148233c325018e4c75df5c120e6d1a))

## [1.0.12](https://github.com/sanity-io/assist/compare/v1.0.11...v1.0.12) (2023-08-08)

### Bug Fixes

- assist inspector should no longer crash in sanity 3.14.5 ([acaf8c7](https://github.com/sanity-io/assist/commit/acaf8c75dd90ccbbd9a86beffc580295b07f79a8))
- **deps:** plugin requires sanity 3.14.5 now ([880614c](https://github.com/sanity-io/assist/commit/880614c4b84c6082f06122f8baadda314ef9f442))

## [1.0.11](https://github.com/sanity-io/assist/compare/v1.0.10...v1.0.11) (2023-07-14)

### Bug Fixes

- **deps:** react-is is now a direct dependency ([af125fa](https://github.com/sanity-io/assist/commit/af125fa91796422510fefb1a9751a7cb3769f2ff))
- **deps:** react-is is now a direct dependency ([111b080](https://github.com/sanity-io/assist/commit/111b080d57b410da550d57ed0b29394d2eda4e81))

## [1.0.10](https://github.com/sanity-io/assist/compare/v1.0.9...v1.0.10) (2023-07-14)

### Bug Fixes

- **deps:** date-fns is now a listed dependency ([c713aac](https://github.com/sanity-io/assist/commit/c713aacb6a75aad03e5368e824784820ef3989b3))
- **deps:** reduced bundle size ([c663cda](https://github.com/sanity-io/assist/commit/c663cda230e0c18b4b388bac9a4f8422bb292d6f))

## [1.0.9](https://github.com/sanity-io/assist/compare/v1.0.8...v1.0.9) (2023-07-07)

### Bug Fixes

- truthy hidden and readOnly fields should not be assistable ([1a33e01](https://github.com/sanity-io/assist/commit/1a33e01b604f997f24eeb11fc1984ed13da05c4e))

## [1.0.8](https://github.com/sanity-io/assist/compare/v1.0.7...v1.0.8) (2023-07-05)

### Bug Fixes

- now only show field refs 4 levels deep ([2a00a4b](https://github.com/sanity-io/assist/commit/2a00a4b66703b51ab18d8045ed07d62e44723c4f))

## [1.0.7](https://github.com/sanity-io/assist/compare/v1.0.6...v1.0.7) (2023-06-30)

### Bug Fixes

- removed stale description from toast ([b94ad7b](https://github.com/sanity-io/assist/commit/b94ad7b9576372187dc9c9fb34d67a1574f0a07e))

## [1.0.6](https://github.com/sanity-io/assist/compare/v1.0.5...v1.0.6) (2023-06-28)

### Bug Fixes

- inspector sometimes not being initialized correctly ([4a687a0](https://github.com/sanity-io/assist/commit/4a687a00f733d292740b2f98019480a658007563))

## [1.0.5](https://github.com/sanity-io/assist/compare/v1.0.4...v1.0.5) (2023-06-28)

### Bug Fixes

- **docs:** caveat section on the limits of LLMs ([3d807f9](https://github.com/sanity-io/assist/commit/3d807f9d06373dd4c6da1bee15842eb6851a4ef0))

## [1.0.4](https://github.com/sanity-io/assist/compare/v1.0.3...v1.0.4) (2023-06-27)

### Bug Fixes

- schema options are now handles the same for types and fields ([172667d](https://github.com/sanity-io/assist/commit/172667d5dc74bc4d3a2ac27005d61cbeaff8f73a))

## [1.0.3](https://github.com/sanity-io/assist/compare/v1.0.2...v1.0.3) (2023-06-27)

### Bug Fixes

- field instructions not being correctly initialized ([a92c6bc](https://github.com/sanity-io/assist/commit/a92c6bcc417ac4e15e6d8b63b83bac47c4718603))

## [1.0.2](https://github.com/sanity-io/assist/compare/v1.0.1...v1.0.2) (2023-06-27)

### Bug Fixes

- field instruction item should no longer be created twice in React strict mode ([b64d95b](https://github.com/sanity-io/assist/commit/b64d95bb1de406def510306f586f2da7aeced70e))

## [1.0.1](https://github.com/sanity-io/assist/compare/v1.0.0...v1.0.1) (2023-06-27)

### Bug Fixes

- **deps:** sanity version 3.13.0+ ([c4f72e9](https://github.com/sanity-io/assist/commit/c4f72e98a8fabbd8a67869fd82e9eafc22eebf71))

## 1.0.0 (2023-06-27)

### Features

- initial version ([82976f8](https://github.com/sanity-io/assist/commit/82976f8ee664cd205ae29aa765e231a7b857be41))

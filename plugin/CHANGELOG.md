<!-- markdownlint-disable --><!-- textlint-disable -->

# 📓 Changelog

All notable changes to this project will be documented in this file. See
[Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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

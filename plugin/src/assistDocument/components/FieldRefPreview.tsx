import {useContext} from 'react'
import {useSelectedField} from '../../assistInspector/helpers'
import {Box, Flex, Text} from '@sanity/ui'
import {PreviewProps} from 'sanity'
import {SelectedFieldContext} from './SelectedFieldContext'
import {InlineBlockValueContext} from '../../assistFormComponents/AssistInlineFormBlock'

export function FieldRefPreview(props: PreviewProps & {path?: string}) {
  const documentSchema = useContext(SelectedFieldContext)?.documentSchema
  const path = (useContext(InlineBlockValueContext) as {path?: string})?.path ?? props.path
  const selectedField = useSelectedField(documentSchema, path)
  return (
    <Flex gap={2} align="center" style={{width: '100%'}}>
      <Flex flex={1} gap={2} align="center" paddingY={3} paddingX={1}>
        {/*<Box>
          <Text>{selectedField?.icon ? createElement(selectedField?.icon) : <CodeIcon />}</Text>
        </Box>*/}
        <Box>
          <Text size={1} textOverflow="ellipsis">
            {selectedField?.title ?? 'Select field'}
          </Text>
        </Box>
      </Flex>
      <>{props.actions}</>
    </Flex>
  )
}

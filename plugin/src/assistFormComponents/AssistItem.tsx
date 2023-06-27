import {ItemProps} from 'sanity'
import {useAssistPresence} from '../presence/useAssistPresence'
import {Box, Flex} from '@sanity/ui'
import {AiFieldPresence} from '../presence/AiFieldPresence'

export function AssistItem(props: ItemProps) {
  const {path} = props
  const presence = useAssistPresence(path, true)

  return (
    <Flex align="center" width="fill" style={{position: 'relative'}}>
      <Box flex={1}>{props.renderDefault({...props})}</Box>
      {presence.map((pre) => (
        <Box key={pre.user.id} style={{position: 'absolute', right: 35}}>
          <AiFieldPresence presence={pre} />
        </Box>
      ))}
    </Flex>
  )
}

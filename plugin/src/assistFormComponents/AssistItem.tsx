import {Box, Flex} from '@sanity/ui'
import {ItemProps} from 'sanity'

import {AiFieldPresence} from '../presence/AiFieldPresence'
import {useAssistPresence} from '../presence/useAssistPresence'

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

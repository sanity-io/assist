// eslint-disable-next-line react/no-unused-prop-types
import {FormNodePresence} from 'sanity'
import {Card, Flex, Text, Tooltip} from '@sanity/ui'
import {Delay} from '../components/Delay'
import {AssistAvatar} from './AssistAvatar'

export function AiFieldPresence(props: {presence: FormNodePresence}) {
  return (
    <Card style={{position: 'relative', background: 'transparent'}} contentEditable={false}>
      <Tooltip
        placement="left"
        content={
          <Card padding={3} border>
            <Flex align="center">
              <Text size={1}>Running instruction...</Text>
            </Flex>
          </Card>
        }
      >
        <div>
          <Delay durationMs={200} ms={250}>
            <AssistAvatar state="active" />
          </Delay>
        </div>
      </Tooltip>
    </Card>
  )
}

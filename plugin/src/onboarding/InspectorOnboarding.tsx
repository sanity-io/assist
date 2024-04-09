import {SparklesIcon} from '@sanity/icons'
import {Box, Button, Container, Flex, Stack, Text} from '@sanity/ui'
import {styled} from 'styled-components'

import {releaseAnnouncementUrl} from '../constants'

const SparklesIllustration = styled(SparklesIcon)({
  fontSize: '3.125em',
  '& path': {
    strokeWidth: `0.6px !important`,
  },
})

export function InspectorOnboarding(props: {onDismiss: () => void}) {
  const {onDismiss} = props
  return (
    <Box padding={4}>
      <Container width={0}>
        <Stack space={4}>
          <div style={{textAlign: 'center'}}>
            <SparklesIllustration />
          </div>
          <Text align="center" size={1}>
            Create reusable AI instructions that can be applied across all documents of a certain
            type.
          </Text>

          <Flex align="center" gap={2} justify="center">
            <Button
              as="a"
              href={releaseAnnouncementUrl}
              rel="noreferrer"
              target="_blank"
              fontSize={1}
              mode="default"
              onClick={onDismiss}
              padding={2}
              text="Learn more"
              tone="primary"
            />
            <Button fontSize={1} mode="bleed" onClick={onDismiss} padding={2} text="Dismiss" />
          </Flex>
        </Stack>
      </Container>
    </Box>
  )
}

import {ArrowRightIcon, CheckmarkIcon, SparklesIcon} from '@sanity/icons'
import {Button, Card, Flex, Popover, Stack, Text} from '@sanity/ui'
import {useRef} from 'react'

import {AssistFeatureBadge} from '../components/AssistFeatureBadge'
import {pluginTitle, releaseAnnouncementUrl} from '../constants'

export interface FieldActionsOnboardingProps {
  dismiss: () => void
}

export function AssistOnboardingPopover(props: FieldActionsOnboardingProps) {
  const {dismiss} = props

  return (
    <Popover
      content={<AssistIntroCard dismiss={dismiss} />}
      open
      portal
      placeholder="bottom"
      tone="default"
      width={0}
    >
      <Card radius={2} shadow={2} style={{padding: 2, lineHeight: 0}}>
        <Button disabled fontSize={1} icon={SparklesIcon} mode="bleed" padding={2} />
      </Card>
    </Popover>
  )
}

function AssistIntroCard(props: {dismiss: () => void}) {
  const buttonRef = useRef<HTMLButtonElement>(null)

  return (
    <Stack as="section" padding={3} space={3}>
      <Stack padding={2} space={4}>
        <Flex gap={2} align="center">
          <Text as="h1" size={1} weight="semibold">
            {pluginTitle}
          </Text>
          <div aria-hidden style={{margin: '-3px 0', lineHeight: 0}}>
            <AssistFeatureBadge />
          </div>
        </Flex>

        <Stack space={3}>
          <Text as="p" muted size={1}>
            Manage reusable AI instructions to boost your content creation and reduce amount of
            repetitive chores.{' '}
            <a href={releaseAnnouncementUrl} target="_blank" rel="noreferrer">
              Learn more <ArrowRightIcon />
            </a>
          </Text>
        </Stack>
      </Stack>

      <Button
        fontSize={1}
        icon={CheckmarkIcon}
        onClick={props.dismiss}
        padding={3}
        ref={buttonRef}
        text="Ok, good to know!"
        tone="primary"
      />
    </Stack>
  )
}

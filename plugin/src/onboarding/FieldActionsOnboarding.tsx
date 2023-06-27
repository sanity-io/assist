import {Path, pathToString} from 'sanity'
import {Button, Flex, Popover, Stack, Text} from '@sanity/ui'
import {PropsWithChildren, useContext, useMemo, useRef} from 'react'
import {FirstAssistedPathContext} from './FirstAssistedPathProvider'
import {AssistFeatureBadge} from '../components/AssistFeatureBadge'
import {ArrowRightIcon, CheckmarkIcon, SparklesIcon} from '@sanity/icons'
import {pluginTitle, releaseAnnouncementUrl} from '../constants'
import {fieldOnboardingKey, useOnboardingFeature} from './onboardingStore'

export interface FieldActionsOnboardingProps {
  path: Path
}

export function FieldActionsOnboarding(props: PropsWithChildren<FieldActionsOnboardingProps>) {
  const {path, children} = props

  const firstAssistedPath = useContext(FirstAssistedPathContext)
  const isFirstAssisted = useMemo(
    () => pathToString(path) === firstAssistedPath,
    [path, firstAssistedPath]
  )

  if (!isFirstAssisted) {
    return <>{children}</>
  }

  return <AssistOnboardingPopover {...props} />
}

function AssistOnboardingPopover(props: PropsWithChildren<FieldActionsOnboardingProps>) {
  const {showOnboarding, dismissOnboarding} = useOnboardingFeature(fieldOnboardingKey)

  if (!showOnboarding) {
    return <>{props.children}</>
  }

  return (
    <Popover
      content={<AssistIntroCard path={props.path} dismiss={dismissOnboarding} />}
      open
      portal
      placeholder="bottom"
      tone="default"
      width={0}
    >
      <div>
        <Button disabled fontSize={1} icon={SparklesIcon} mode="ghost" padding={2} />
      </div>
    </Popover>
  )
}

function AssistIntroCard(props: FieldActionsOnboardingProps & {dismiss: () => void}) {
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

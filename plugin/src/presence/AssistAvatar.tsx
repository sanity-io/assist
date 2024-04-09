import {purple} from '@sanity/color'
import {SparklesIcon} from '@sanity/icons'
import {Text} from '@sanity/ui'
import {type CSSProperties, useMemo} from 'react'
import {useColorSchemeValue} from 'sanity'
import {keyframes, styled} from 'styled-components'

const Root = styled.span`
  display: block;
  width: 25px;
  height: 25px;
  position: relative;
`

const dash = keyframes`
  0% {
    transform: rotate(0);
  }
  100% {
    transform: rotate(43deg);
  }
`

const Outline = styled.svg`
  display: block;
  position: absolute;
  top: 0;
  left: 0;

  & > circle {
    stroke: var(--ai-avatar-stroke-color);
    stroke-width: 1.5px;
    stroke-linecap: round;
    transform-origin: center;
    animation: ${dash} 500ms ease-in-out infinite;
    transition: stroke-dasharray 200ms ease-in-out;

    stroke-dasharray: 2.34px 0;

    [data-state='active'] > & {
      stroke-dasharray: 2px 2.34px;
    }
  }
`

const IconDisc = styled.span`
  background: var(--ai-avatar-disc-color);
  color: white;
  width: 21px;
  height: 21px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10.5px;
  position: absolute;
  top: 2px;
  left: 2px;
`

export function AssistAvatar(props: {state?: 'present' | 'active'}) {
  const {state = 'present'} = props
  const scheme = useColorSchemeValue()

  const style = useMemo(() => {
    if (scheme === 'dark') {
      return {
        [`--ai-avatar-stroke-color`]: purple[400].hex,
        [`--ai-avatar-disc-color`]: purple[600].hex,
      } as CSSProperties
    }

    return {
      [`--ai-avatar-stroke-color`]: purple[500].hex,
      [`--ai-avatar-disc-color`]: purple[600].hex,
    } as CSSProperties
  }, [scheme])

  return (
    <Root data-state={state} style={style}>
      <Outline
        width="25"
        height="25"
        viewBox="0 0 25 25"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="12.5" cy="12.5" r="11.75" />
      </Outline>
      <IconDisc>
        <Text as="span" size={0} style={{color: 'inherit'}}>
          <SparklesIcon style={{color: 'inherit'}} />
        </Text>
      </IconDisc>
    </Root>
  )
}

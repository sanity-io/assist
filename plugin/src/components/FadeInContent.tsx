import {ReactElement, ReactNode} from 'react'
import styled, {keyframes} from 'styled-components'

const fadeIn = keyframes`
  0% {
    opacity: 0;
    transform: scale(0.75);
  }
  40% {
    opacity: 0;
    transform: scale(0.75);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
`

const FadeInDiv = styled.div`
  animation-name: ${fadeIn};
  animation-timing-function: ease-in-out;
`

export function FadeInContent({
  children,
  durationMs = 250,
}: {
  children?: ReactNode
  ms?: number
  durationMs?: number
}): ReactElement {
  return <FadeInDiv style={{animationDuration: `${durationMs}ms`}}>{children}</FadeInDiv>
}

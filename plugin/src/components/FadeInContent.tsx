import {forwardRef, type ReactElement, type ReactNode} from 'react'
import {keyframes, styled} from 'styled-components'

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

export const FadeInContent = forwardRef(function FadeInContent(
  {
    children,
    durationMs = 250,
  }: {
    children?: ReactNode
    ms?: number
    durationMs?: number
  },
  ref: any,
): ReactElement {
  return (
    <FadeInDiv ref={ref} style={{animationDuration: `${durationMs}ms`}}>
      {children}
    </FadeInDiv>
  )
})

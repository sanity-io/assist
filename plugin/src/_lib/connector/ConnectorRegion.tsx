import {HTMLProps, useEffect} from 'react'

import {ConnectorRegionRects} from './types'
import {useRegionRects} from './useRegionRects'

export function ConnectorRegion(
  props: {
    onRectsChange?: (rects: ConnectorRegionRects | null) => void
  } & HTMLProps<HTMLDivElement>,
) {
  const {children, onRectsChange, ...restProps} = props

  const {bounds, element, ref} = useRegionRects()

  useEffect(() => {
    onRectsChange?.(bounds && element ? {bounds, element} : null)
  }, [bounds, element, onRectsChange])

  return (
    <div {...restProps} ref={ref}>
      {children}
    </div>
  )
}

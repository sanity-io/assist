import {HTMLProps, useEffect, useState} from 'react'

import {ConnectorRegion} from './ConnectorRegion'
import {ConnectorRegionRects} from './types'
import {useConnectorsStore} from './useConnectorsStore'

export function ConnectToRegion(props: {_key: string} & HTMLProps<HTMLDivElement>) {
  const {children, _key: key, ...restProps} = props
  const aiConnectors = useConnectorsStore()
  const [rects, setRects] = useState<ConnectorRegionRects | null>(null)

  useEffect(() => aiConnectors.to.subscribe(key), [aiConnectors, key])

  useEffect(() => {
    if (rects) aiConnectors.to.next(key, rects)
  }, [aiConnectors, key, rects])

  return (
    <ConnectorRegion {...restProps} onRectsChange={setRects}>
      {children}
    </ConnectorRegion>
  )
}

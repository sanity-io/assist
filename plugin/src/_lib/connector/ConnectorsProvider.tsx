import {ReactNode, useEffect, useMemo} from 'react'

import {ConnectorsStore, createConnectorsStore} from './ConnectorsStore'
import {ConnectorsStoreContext} from './ConnectorsStoreContext'
import {Connector} from './types'

export function ConnectorsProvider(props: {
  children?: ReactNode
  onConnectorsChange?: (connectors: Connector[]) => void
}) {
  const {children, onConnectorsChange} = props
  const store: ConnectorsStore = useMemo(() => createConnectorsStore(), [])

  useEffect(
    () => onConnectorsChange && store.connectors.subscribe(onConnectorsChange),
    [onConnectorsChange, store],
  )

  return <ConnectorsStoreContext.Provider value={store}>{children}</ConnectorsStoreContext.Provider>
}

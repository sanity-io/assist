import {useContext} from 'react'

import {ConnectorsStore} from './ConnectorsStore'
import {ConnectorsStoreContext} from './ConnectorsStoreContext'

export function useConnectorsStore(): ConnectorsStore {
  const store = useContext(ConnectorsStoreContext)

  if (!store) {
    throw new Error('Missing connectors store context')
  }

  return store
}

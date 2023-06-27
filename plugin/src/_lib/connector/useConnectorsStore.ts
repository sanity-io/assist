import {useContext} from 'react'
import {ConnectorsStoreContext} from './ConnectorsStoreContext'
import {ConnectorsStore} from './ConnectorsStore'

export function useConnectorsStore(): ConnectorsStore {
  const store = useContext(ConnectorsStoreContext)

  if (!store) {
    throw new Error('Missing connectors store context')
  }

  return store
}

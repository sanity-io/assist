import {createContext} from 'react'

import {ConnectorsStore} from './ConnectorsStore'

export const ConnectorsStoreContext = createContext<ConnectorsStore | null>(null)

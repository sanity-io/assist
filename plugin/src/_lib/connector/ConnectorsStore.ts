import {Connector, ConnectorRegionRects} from './types'

export interface ConnectorsStore {
  connectors: {
    subscribe: (observer: (connectors: Connector[]) => void) => () => void
  }

  from: {
    subscribe: (key: string, payload?: Record<string, unknown>) => () => void
    next: (key: string, rects: ConnectorRegionRects) => void
  }

  to: {
    subscribe: (key: string, payload?: Record<string, unknown>) => () => void
    next: (key: string, rects: ConnectorRegionRects) => void
  }
}

export function createConnectorsStore(): ConnectorsStore {
  const configKeys: string[] = []
  const fieldKeys: string[] = []

  const channels = {
    from: new Map<string, ConnectorRegionRects | null>(),
    to: new Map<string, ConnectorRegionRects | null>(),
  }

  const payloads = {
    from: new Map<string, Record<string, unknown> | undefined>(),
    to: new Map<string, Record<string, unknown> | undefined>(),
  }

  const observers: ((connectors: Connector[]) => void)[] = []

  function notifyObservers() {
    const connectors: Connector[] = []

    for (const key of configKeys) {
      const toRects = channels.to.get(key)
      const toPayload = payloads.from.get(key)

      const fromRects = channels.from.get(key)
      const fromPayload = payloads.from.get(key)

      if (toRects && fromRects) {
        connectors.push({
          key,
          from: {...fromRects, payload: fromPayload},
          to: {...toRects, payload: toPayload},
        })
      }
    }

    for (const observer of observers) {
      observer(connectors)
    }
  }

  return {
    to: {
      subscribe(key, payload) {
        channels.to.set(key, null)
        payloads.to.set(key, payload)

        configKeys.push(key)

        return () => {
          channels.to.delete(key)
          payloads.to.delete(key)

          const idx = configKeys.indexOf(key)

          if (idx > -1) configKeys.splice(idx, 1)

          notifyObservers()
        }
      },
      next(key, rects) {
        channels.to.set(key, rects)

        if (fieldKeys.includes(key)) notifyObservers()
      },
    },

    connectors: {
      subscribe(observer) {
        observers.push(observer)

        return () => {
          const idx = observers.indexOf(observer)

          if (idx > -1) observers.splice(idx, 1)
        }
      },
    },

    from: {
      subscribe(key, payload) {
        channels.from.set(key, null)
        payloads.from.set(key, payload)

        fieldKeys.push(key)

        return () => {
          channels.from.delete(key)
          payloads.from.delete(key)

          const idx = fieldKeys.indexOf(key)

          if (idx > -1) fieldKeys.splice(idx, 1)

          notifyObservers()
        }
      },
      next(key, rects) {
        channels.from.set(key, rects)

        if (configKeys.includes(key)) notifyObservers()
      },
    },
  }
}

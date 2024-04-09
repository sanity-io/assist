import {Fragment, useEffect, useState} from 'react'

import {Connector, ConnectorOptions} from '../_lib/connector'
import {ConnectorPath} from './ConnectorPath'

const DEBUG = false

const options: ConnectorOptions = {
  arrow: {
    marginX: 10.5,
    marginY: 5,
    size: 4,
    threshold: 16.5,
  },
  divider: {
    offsetX: -10.5,
  },
  path: {
    cornerRadius: 3,
    marginY: 10.5,
    strokeWidth: 1,
  },
}

export function AssistConnectorsOverlay(props: {connectors: Connector[]}) {
  const {connectors} = props
  // const zIndexes = connectors.map((connector) => {
  //   const zIndex = connector.from.payload?.zIndex

  //   if (typeof zIndex === 'number') {
  //     return zIndex
  //   }

  //   return 1
  // })
  const [, setRedraw] = useState(false)
  useEffect(() => {
    // hacky workaround to force redraw for connectors on initial render
    // this seem to improve initial measurements of elements
    setRedraw(true)
  }, [])

  // const zIndex = zIndexes.length ? Math.max(...zIndexes) : 1

  return (
    <>
      <svg
        fill="none"
        width={window.innerWidth}
        height={window.innerHeight}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 150,
          // zIndex,
        }}
      >
        {connectors.map((connector) => (
          <ConnectorPath
            from={connector.from}
            key={connector.key}
            options={options}
            to={connector.to}
          />
        ))}
      </svg>
      {DEBUG &&
        connectors.map(({key, from, to}) => {
          return (
            <Fragment key={key}>
              <div
                style={{
                  position: 'fixed',
                  top: from.bounds.y,
                  left: from.bounds.x,
                  width: from.bounds.w,
                  height: from.bounds.h,
                  pointerEvents: 'none',
                  overflow: 'hidden',
                  outline: '1px dotted red',
                  outlineOffset: -1,
                  zIndex: 10000000 - 1,
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: from.element.y - from.bounds.y,
                    left: from.element.x - from.bounds.x,
                    width: from.element.w,
                    height: from.element.h,
                    border: '1px solid red',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div
                style={{
                  position: 'fixed',
                  top: to.bounds.y,
                  left: to.bounds.x,
                  width: to.bounds.w,
                  height: to.bounds.h,
                  pointerEvents: 'none',
                  overflow: 'hidden',
                  outline: '1px dotted teal',
                  outlineOffset: -1,
                  zIndex: 10000000 - 1,
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: to.element.y - to.bounds.y,
                    left: to.element.x - to.bounds.x,
                    width: to.element.w,
                    height: to.element.h,
                    border: '1px solid teal',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </Fragment>
          )
        })}
    </>
  )
}

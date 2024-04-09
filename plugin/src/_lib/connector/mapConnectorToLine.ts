import {
  ConnectorLine,
  ConnectorLinePoint,
  ConnectorOptions,
  ConnectorRegionRects,
  Rect,
} from './types'

function getConnectorLinePoint(
  options: ConnectorOptions,
  rect: Rect,
  bounds: Rect,
): ConnectorLinePoint {
  const centerY = rect.y + rect.h / 2
  const isAbove = rect.y + rect.h < bounds.y + options.arrow.marginY
  const isBelow = rect.y > bounds.y + bounds.h - options.arrow.marginY

  return {
    bounds,
    x: rect.x,
    y: centerY,
    centerY,
    startY: rect.y + options.path.marginY,
    endY: rect.y + rect.h - options.path.marginY,
    isAbove,
    isBelow,
    outOfBounds: isAbove || isBelow,
  }
}

export function mapConnectorToLine(
  options: ConnectorOptions,
  connector: {from: ConnectorRegionRects; to: ConnectorRegionRects},
): ConnectorLine {
  const fromBounds: Rect = {
    y: connector.from.bounds.y + options.arrow.threshold,
    // bottom: connector.from.bounds.y + connector.from.bounds.h - options.arrow.threshold,
    x: connector.from.bounds.x,
    // right: connector.from.bounds.x + connector.from.bounds.w,
    w: connector.from.bounds.w,
    h: connector.from.bounds.h - options.arrow.threshold * 2,
  }

  const from = getConnectorLinePoint(options, connector.from.element, fromBounds)
  from.x = connector.from.element.x + connector.from.element.w // + 1

  const fromBottom = fromBounds.y + fromBounds.h

  const toBounds: Rect = {
    y: connector.to.bounds.y + options.arrow.threshold,
    // bottom: connector.to.bounds.y + connector.to.bounds.h - options.arrow.threshold,
    x: connector.to.bounds.x,
    // right: connector.to.bounds.x + connector.to.bounds.w,
    w: connector.to.bounds.w,
    h: connector.to.bounds.h - options.arrow.threshold * 2,
  }

  const toBottom = toBounds.y + toBounds.h

  const to = getConnectorLinePoint(options, connector.to.element, toBounds)

  const maxStartY = Math.max(to.startY, from.startY)

  // Align from <-> to vertically
  from.y = Math.min(maxStartY, from.endY)
  if (from.y < toBounds.y) {
    from.y = Math.min(toBounds.y, from.endY)
  } else if (from.y > toBottom) {
    from.y = Math.max(toBottom, from.startY)
  }
  to.y = Math.min(maxStartY, to.endY)
  if (to.y < fromBounds.y) {
    to.y = Math.min(fromBounds.y, to.endY)
  } else if (to.y > fromBottom) {
    to.y = Math.max(fromBottom, to.startY)
  }

  // Keep within bounds
  from.y = Math.min(Math.max(from.y, fromBounds.y), fromBottom)
  to.y = Math.min(Math.max(to.y, toBounds.y), toBottom)

  return {from, to}
}

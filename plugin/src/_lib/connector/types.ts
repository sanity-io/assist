export interface Rect {
  x: number
  y: number
  w: number
  h: number
}

export interface Scroll {
  x: number
  y: number
}

export interface ConnectorLinePoint {
  bounds: Rect
  x: number
  y: number
  startY: number
  centerY: number
  endY: number
  isAbove: boolean
  isBelow: boolean
  outOfBounds: boolean
}

export interface ConnectorLine {
  from: ConnectorLinePoint
  to: ConnectorLinePoint
}

export interface ConnectorOptions {
  arrow: {
    marginX: number
    marginY: number
    size: number
    threshold: number
  }
  divider: {
    offsetX: number
  }
  path: {
    cornerRadius: number
    marginY: number
    strokeWidth: number
  }
}

export interface ConnectorRegionRects {
  bounds: Rect
  element: Rect
}

export interface Connector {
  key: string
  from: ConnectorRegionRects & {payload?: Record<string, unknown>}
  to: ConnectorRegionRects & {payload?: Record<string, unknown>}
}

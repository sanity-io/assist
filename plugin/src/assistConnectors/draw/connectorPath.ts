import {ConnectorLine, ConnectorOptions} from '../../_lib/connector'

export function drawArrowPath(
  options: ConnectorOptions,
  x: number,
  y: number,
  dir: number,
): string {
  return [
    `M ${x - options.arrow.size} ${y - options.arrow.size * dir} `,
    `L ${x} ${y}`,
    `L ${x + options.arrow.size} ${y - options.arrow.size * dir}`,
  ].join('')
}

function moveTo(x: number, y: number) {
  return `M${x} ${y}`
}

function lineTo(x: number, y: number) {
  return `L${x} ${y}`
}

function join(strings: string[], delim = '') {
  return strings.join(delim)
}

function quadCurve(x1: number, y1: number, x: number, y: number) {
  return `Q${x1} ${y1} ${x} ${y}`
}

export function drawConnectorPath(options: ConnectorOptions, line: ConnectorLine): string {
  const {cornerRadius} = options.path
  const {from, to} = line
  const {x: fromX, y: fromY} = from
  const {x: _toX, y: toY} = to

  const toX = _toX - 1

  // Calculate divider position
  const dividerX = to.bounds.x + options.divider.offsetX

  // Calculate connector FROM path X position
  const fromPathX = from.isAbove || from.isBelow ? fromX + options.arrow.marginX : fromX

  // Calculate maximum corner radius
  const r0 = Math.min(cornerRadius, Math.abs(fromPathX - dividerX) / 2)
  const r1 = Math.min(cornerRadius, Math.abs(fromY - toY) / 2)

  const cmds: string[] = []

  // FROM
  if (from.isAbove) {
    cmds.push(
      moveTo(
        fromX + options.arrow.marginX,
        fromY - options.arrow.threshold + options.arrow.marginY,
      ),
      lineTo(fromX + options.arrow.marginX, fromY - r0),
      quadCurve(fromX + options.arrow.marginX, fromY, fromX + options.arrow.marginX + r0, fromY),
    )
  } else if (from.isBelow) {
    cmds.push(
      moveTo(
        fromX + options.arrow.marginX,
        fromY + options.arrow.threshold - options.arrow.marginY,
      ),
      lineTo(fromX + options.arrow.marginX, fromY + r0),
      quadCurve(fromX + options.arrow.marginX, fromY, fromX + options.arrow.marginX + r0, fromY),
    )
  } else {
    cmds.push(moveTo(fromX, fromY))
  }

  // TO
  if (to.isAbove) {
    if (fromY < to.bounds.y) {
      cmds.push(
        lineTo(dividerX - r1, fromY),
        quadCurve(dividerX, fromY, dividerX, fromY + r1),
        lineTo(dividerX, toY - r1),
        quadCurve(dividerX, toY, dividerX + r1, toY),
        lineTo(dividerX - cornerRadius, toY),
        quadCurve(dividerX, toY, dividerX, toY - cornerRadius),
        lineTo(dividerX, toY - options.arrow.threshold + options.arrow.marginY),
      )
    } else {
      cmds.push(
        lineTo(dividerX - cornerRadius, fromY),
        quadCurve(dividerX, fromY, dividerX, fromY - cornerRadius),
        lineTo(dividerX, toY - options.arrow.threshold + options.arrow.marginY),
      )
    }
  } else if (to.isBelow) {
    if (fromY > to.bounds.y + to.bounds.h) {
      // curl around
      cmds.push(
        lineTo(dividerX - options.arrow.marginX - r1, fromY),
        quadCurve(
          dividerX - options.arrow.marginX,
          fromY,
          dividerX - options.arrow.marginX,
          fromY - r1,
        ),
        lineTo(dividerX - options.arrow.marginX, toY + r1),
        quadCurve(
          dividerX - options.arrow.marginX,
          toY,
          dividerX - options.arrow.marginX + r1,
          toY,
        ),
        lineTo(dividerX - cornerRadius, toY),
        quadCurve(dividerX, toY, dividerX, toY + cornerRadius),
        lineTo(dividerX, toY + options.arrow.threshold - options.arrow.marginY),
      )
    } else {
      cmds.push(
        lineTo(dividerX - cornerRadius, fromY),
        quadCurve(dividerX, fromY, dividerX, fromY + cornerRadius),
        lineTo(dividerX, toY + options.arrow.threshold - options.arrow.marginY),
      )
    }
  } else if (fromY < toY) {
    cmds.push(
      lineTo(dividerX - r0, fromY),
      quadCurve(dividerX, fromY, dividerX, fromY + r1),
      lineTo(dividerX, toY - r1),
      quadCurve(dividerX, toY, dividerX + r1, toY),
      lineTo(toX, toY),
    )
  } else {
    cmds.push(
      lineTo(dividerX - Math.min(r0, r1), fromY),
      quadCurve(dividerX, fromY, dividerX, fromY - Math.min(r0, r1)),
      lineTo(dividerX, toY + r1),
      quadCurve(dividerX, toY, dividerX + r1, toY),
      lineTo(toX, toY),
    )
  }

  return join(cmds)
}

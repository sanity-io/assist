import {ConnectorOptions} from '../../_lib/connector'

export function arrowPath(options: ConnectorOptions, x: number, y: number, dir: 1 | -1): string {
  return [
    `M ${x - options.arrow.size} ${y - options.arrow.size * dir} `,
    `L ${x} ${y}`,
    `L ${x + options.arrow.size} ${y - options.arrow.size * dir}`,
  ].join('')
}

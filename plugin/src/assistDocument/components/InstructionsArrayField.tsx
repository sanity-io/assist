import {ArrayFieldProps} from 'sanity'

export function InstructionsArrayField(props: ArrayFieldProps) {
  return props.renderDefault({
    ...props,
    title: ' ',
  })
}

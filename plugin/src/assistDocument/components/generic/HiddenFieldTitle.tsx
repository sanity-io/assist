import {FieldProps} from 'sanity'

export function HiddenFieldTitle(props: FieldProps) {
  return props.renderDefault({...props, title: '', level: props.level - 2, changed: false})
}

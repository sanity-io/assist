import {icons} from '@sanity/icons'
import {Button, Menu, MenuButton, MenuItem} from '@sanity/ui'
import {ElementType, ReactNode, useCallback, useId, useMemo} from 'react'
import {set, StringInputProps} from 'sanity'

export function IconInput(props: StringInputProps) {
  const {value, onChange} = props
  const id = useId()
  const items = useMemo(
    () =>
      Object.entries(icons).map(([key, icon]) => (
        <IconItem key={key} iconKey={key} icon={icon} onChange={onChange} />
      )),
    [onChange],
  )

  const selectedIcon = useMemo(() => getIcon(value), [value])

  return (
    <MenuButton
      button={
        <Button icon={selectedIcon} title="Select icon" padding={3} mode="ghost" radius={1} />
      }
      id={id}
      menu={<Menu style={{maxHeight: 300}}>{items}</Menu>}
      popover={{portal: true}}
    />
  )
}

function IconItem({
  icon,
  iconKey: key,
  onChange,
}: {
  iconKey: string
  icon: ElementType | ReactNode
  onChange: StringInputProps['onChange']
}) {
  const onClick = useCallback(() => onChange(set(key)), [onChange, key])
  return <MenuItem icon={icon} title={key} text={key} onClick={onClick} />
}

export function getIcon(iconName?: string) {
  return Object.entries(icons).find(([key]) => key === iconName)?.[1] ?? icons.sparkles
}

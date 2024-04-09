import {Box} from '@sanity/ui'
import {useEffect, useRef} from 'react'
import {ObjectInputProps} from 'sanity'

export function HideReferenceChangedBannerInput(props: ObjectInputProps) {
  const ref = useRef<HTMLDivElement>(null)

  // hides "reference was changed" banner (it is incorrectly flashing because the pane handler does not support the way wie use the assist pane)
  useEffect(() => {
    const parent = ref.current?.closest('[data-testid="pane-content"]')
    if (!parent) {
      return
    }
    const style = document.createElement('style')
    const parentId = `id-${Math.random()}`.replace('.', '-')
    parent.id = parentId

    style.innerText = `
      #${parentId} [data-testid="reference-changed-banner"] { display: none; }
    `
    parent.prepend(style)
  }, [ref])

  return <Box ref={ref}>{props.renderDefault(props)}</Box>
}

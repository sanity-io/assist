import {useEffect, useMemo, useRef, useState} from 'react'

import {hasOverflowScroll} from './helpers'
import {Rect, Scroll} from './types'

export function useRegionRects() {
  const ref = useRef<HTMLDivElement>(null)

  const [relativeBoundsRect, setRelativeBoundsRect] = useState<Rect | null>(null)
  const [relativeElementRect, setRelativeElementRect] = useState<Rect | null>(null)
  const [boundsScroll, setBoundsScroll] = useState<Scroll>({x: 0, y: 0})
  const [scroll, setScroll] = useState<Scroll>({x: 0, y: 0})

  const boundsScrollXRef = useRef(0)
  const boundsScrollYRef = useRef(0)

  const elementScrollXRef = useRef(0)
  const elementScrollYRef = useRef(0)

  useEffect(() => {
    const el = ref.current

    if (!el) return undefined

    const scrollParents: HTMLElement[] = []
    let parent = el.parentElement

    while (parent && parent !== document.body) {
      if (
        hasOverflowScroll(parent)
        // || parent.scrollHeight > parent.clientHeight
      ) {
        scrollParents.push(parent)
      }

      parent = parent.parentElement
    }

    function handleResize() {
      const scrollParent = scrollParents[0]

      const boundsRect = scrollParent?.getBoundingClientRect() || {
        x: 0,
        y: 0,
        width: window.innerWidth,
        height: window.innerHeight,
      }

      const domRect = el!.getBoundingClientRect()

      setRelativeBoundsRect({
        x: boundsRect.x + boundsScrollXRef.current,
        y: boundsRect.y + boundsScrollYRef.current,
        w: boundsRect.width,
        h: boundsRect.height,
      })

      setRelativeElementRect({
        x: domRect.x + elementScrollXRef.current,
        y: domRect.y + elementScrollYRef.current,
        w: domRect.width,
        h: domRect.height,
      })
    }

    function handleScroll() {
      let scrollX = window.scrollX
      let scrollY = window.scrollY

      for (const scrollParent of scrollParents) {
        scrollX += scrollParent.scrollLeft
        scrollY += scrollParent.scrollTop
      }

      const scrollParent = scrollParents[0]

      boundsScrollXRef.current = scrollX - (scrollParent?.scrollLeft || window.scrollX)

      boundsScrollYRef.current = scrollY - (scrollParent?.scrollTop || window.scrollY)

      setBoundsScroll({
        x: boundsScrollXRef.current,
        y: boundsScrollYRef.current,
      })

      elementScrollXRef.current = scrollX
      elementScrollYRef.current = scrollY

      setScroll({x: scrollX, y: scrollY})
    }

    window.addEventListener('scroll', handleScroll, {passive: true})

    const ro = new ResizeObserver(handleResize)

    ro.observe(el)

    for (const scrollParent of scrollParents) {
      scrollParent.addEventListener('scroll', handleScroll, {passive: true})
      ro.observe(scrollParent)
    }

    handleScroll()

    return () => {
      ro.unobserve(el)

      for (const scrollParent of scrollParents) {
        ro.unobserve(scrollParent)
        scrollParent.removeEventListener('scroll', handleScroll)
      }

      ro.disconnect()

      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const bounds: Rect | null = useMemo(
    () =>
      relativeBoundsRect && {
        x: relativeBoundsRect.x - boundsScroll.x,
        y: relativeBoundsRect.y - boundsScroll.y,
        w: relativeBoundsRect.w,
        h: relativeBoundsRect.h,
      },
    [relativeBoundsRect, boundsScroll],
  )

  const element: Rect | null = useMemo(
    () =>
      relativeElementRect && {
        x: relativeElementRect.x - scroll.x,
        y: relativeElementRect.y - scroll.y,
        w: relativeElementRect.w,
        h: relativeElementRect.h,
      },
    [relativeElementRect, scroll],
  )

  return {bounds, element, ref}
}

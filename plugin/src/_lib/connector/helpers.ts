export function hasOverflowScroll(el: HTMLElement): boolean {
  const overflow = getComputedStyle(el).overflow

  return overflow.includes('auto') || overflow.includes('hidden') || overflow.includes('scroll')
}

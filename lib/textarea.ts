import type { KeyboardEvent } from 'react'

export function autoGrow(el: HTMLTextAreaElement) {
  el.style.height = 'auto'
  el.style.height = `${el.scrollHeight}px`
}

export function isSubmitShortcut(e: KeyboardEvent<HTMLTextAreaElement>) {
  if (e.nativeEvent.isComposing || e.keyCode === 229) return false
  return e.key === 'Enter' && (e.metaKey || e.ctrlKey)
}

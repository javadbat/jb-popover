export function getComposedParent(element: Element): Element | null {
  if (element.assignedSlot) return element.assignedSlot;
  if (element.parentElement) return element.parentElement;
  const root = element.getRootNode();
  return root instanceof ShadowRoot ? root.host : null;
}

export function getScrollParent(element: HTMLElement) {
  let parent: Element | null = getComposedParent(element);
  while (parent) {
    const style = getComputedStyle(parent);
    if (/(auto|scroll|overlay)/.test(style.overflow + style.overflowY + style.overflowX)) return parent;
    parent = getComposedParent(parent);
  }
  return null;
}

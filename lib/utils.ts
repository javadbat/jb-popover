export function getScrollParent(el:HTMLElement) {
  let p = el.parentElement;
  while (p) {
    const s = getComputedStyle(p);
    if (/(auto|scroll|overlay)/.test(s.overflow + s.overflowY + s.overflowX)) return p;
    // we will also cross shadowRoot boundary to watch scrollable
    p = p.parentElement??(p.getRootNode() as ShadowRoot|null)?.host.parentElement??null;
  }
  return null;
}
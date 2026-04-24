export function getScrollParent(el:HTMLElement) {
  let p = el.parentElement;
  while (p) {
    const s = getComputedStyle(p);
    if (/(auto|scroll|overlay)/.test(s.overflow + s.overflowY + s.overflowX)) return p;
    p = p.parentElement;
  }
  return window;
}
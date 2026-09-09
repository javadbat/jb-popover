import type { JBPopoverWebComponent } from "./jb-popover.js";
import { getComposedParent } from "./utils.js";

/** Observes an open anchor and batches positioning work before repaint. */
export class PositionController {
  #component: JBPopoverWebComponent;
  #target: HTMLElement | null = null;
  #listeners?: AbortController;
  #frame: number | null = null;
  constructor(component: JBPopoverWebComponent) {
    this.#component = component;
  }
  get target() {
    return this.#target;
  }
  bind(target: HTMLElement | null) {
    this.#target = target;
    this.observe();
    this.update();
  }
  stop() {
    this.#listeners?.abort();
    this.#listeners = undefined;
    if (this.#frame !== null) cancelAnimationFrame(this.#frame);
    this.#frame = null;
  }
  schedule = () => {
    if (!this.#component.isOpen || this.#frame !== null) return;
    this.#frame = requestAnimationFrame(() => {
      this.#frame = null;
      this.update();
    });
  };
  observe() {
    this.stop();
    if (!this.#component.isOpen || !this.#component.isConnected || !this.#target || this.#component.isMobileMode) return;
    this.#listeners = new AbortController();
    const signal = this.#listeners.signal;
    // Observe every scroll ancestor, including shadow hosts and nested scrollers.
    let ancestor: Element | null = getComposedParent(this.#target);
    while (ancestor) {
      ancestor.addEventListener("scroll", this.schedule, { passive: true, signal });
      ancestor = getComposedParent(ancestor);
    }
    window.addEventListener("scroll", this.schedule, { passive: true, signal });
    const observer = new ResizeObserver(this.schedule);
    observer.observe(this.#target);
    observer.observe(this.#component.elements.contentWrapper);
    const parent = getComposedParent(this.#target);
    if (parent) observer.observe(parent);
    signal.addEventListener("abort", () => observer.disconnect(), { once: true });
  }
  #createsFixedContainingBlock(style: CSSStyleDeclaration) {
    const hasEffect = (value: string) => value !== "" && value !== "none";
    const willChange = style.willChange.split(",").map(value => value.trim());
    const contain = style.contain.split(" ");
    return (
      hasEffect(style.transform) ||
      hasEffect(style.translate) ||
      hasEffect(style.rotate) ||
      hasEffect(style.scale) ||
      hasEffect(style.perspective) ||
      hasEffect(style.filter) ||
      hasEffect(style.backdropFilter) ||
      hasEffect(style.getPropertyValue("-webkit-backdrop-filter")) ||
      willChange.some(value => ["transform", "translate", "rotate", "scale", "perspective", "filter", "backdrop-filter"].includes(value)) ||
      contain.some(value => ["layout", "paint", "strict", "content"].includes(value)) ||
      style.contentVisibility === "auto"
    );
  }
  /**
   * Fixed elements normally use the viewport, but transformed/filtering ancestors
   * (including modal animation wrappers) establish a local containing block.
   */
  #getFixedContainingBlockBoundary() {
    let ancestor = getComposedParent(this.#component.elements.componentWrapper);
    while (ancestor) {
      if (ancestor instanceof HTMLElement && this.#createsFixedContainingBlock(getComputedStyle(ancestor))) {
        const boundary = ancestor.getBoundingClientRect();
        const left = boundary.left + ancestor.clientLeft;
        const top = boundary.top + ancestor.clientTop;
        return {
          left,
          top,
          right: left + ancestor.clientWidth,
          bottom: top + ancestor.clientHeight,
        };
      }
      ancestor = getComposedParent(ancestor);
    }
    return { left: 0, top: 0, right: window.innerWidth, bottom: window.innerHeight };
  }
  update() {
    const component = this.#component;
    if (!component.isOpen || !component.isConnected) return;
    const wrapper = component.elements.componentWrapper;
    if (!this.#target || component.isMobileMode) {
      for (const property of ["position", "transform", "inset-block-start", "inset-block-end", "inset-inline-start", "inset-inline-end"]) wrapper.style.removeProperty(property);
      if (component.isMobileMode) component.elements.contentWrapper.style.removeProperty("transform");
      return;
    }
    const anchor = this.#target.getBoundingClientRect();
    const boundary = this.#getFixedContainingBlockBoundary();
    const rtl = getComputedStyle(this.#target).direction === "rtl";
    const wrapperRTL = getComputedStyle(wrapper).direction === "rtl";
    const { inline, block } = component.positionArea;
    const center = (anchor.left + anchor.right) / 2;
    const alignStart = inline === "start" || inline === "center-after";
    const side = inline === "center" || alignStart !== rtl ? "left" : "right";
    let point = inline.startsWith("center") ? center : inline === "start" ? (rtl ? anchor.right : anchor.left) : rtl ? anchor.left : anchor.right;
    let after = block === "after";
    let verticalPoint = after ? anchor.bottom : anchor.top;
    if (component.autoPlacement) {
      const { width, height } = component.elements.contentWrapper.getBoundingClientRect();
      const padding = 8;
      const below = window.innerHeight - anchor.bottom - padding;
      const above = anchor.top - padding;
      if ((after ? below : above) < height && (after ? above : below) > (after ? below : above)) after = !after;
      const desiredLeft = inline === "center" ? point - width / 2 : side === "left" ? point : point - width;
      const left = Math.max(padding, Math.min(desiredLeft, window.innerWidth - width - padding));
      point += left - desiredLeft;
      const desiredTop = after ? anchor.bottom : anchor.top - height;
      const top = Math.max(padding, Math.min(desiredTop, window.innerHeight - height - padding));
      verticalPoint = after ? top : top + height;
    }
    // Read geometry first, then write once. Logical insets retain RTL compatibility.
    const useStart = (side === "left") !== wrapperRTL;
    const horizontal = side === "left" ? point - boundary.left : boundary.right - point;
    wrapper.style.position = "fixed";
    wrapper.style.transform = inline === "center" ? "translateX(-50%)" : "none";
    wrapper.style.insetInlineStart = useStart ? `${horizontal}px` : "unset";
    wrapper.style.insetInlineEnd = useStart ? "unset" : `${horizontal}px`;
    wrapper.style.insetBlockStart = after ? `${verticalPoint - boundary.top}px` : "unset";
    wrapper.style.insetBlockEnd = after ? "unset" : `${boundary.bottom - verticalPoint}px`;
  }
}

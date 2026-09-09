import type { JBPopoverWebComponent } from "./jb-popover.js";
import { getComposedParent } from "./utils.js";

/** keep the list of all currently opened popover  */
const stack: OverlayController[] = [];
const inertElements = new Map<HTMLElement, boolean>();
let restoreScroll: (() => void) | undefined;

function contains(root: Element, element: Element | null): boolean {
  while (element) {
    if (element === root) return true;
    element = getComposedParent(element);
  }
  return false;
}
function activeElement(): HTMLElement | null {
  let element = document.activeElement;
  while (element?.shadowRoot?.activeElement) element = element.shadowRoot.activeElement;
  return element instanceof HTMLElement ? element : null;
}
function focusable(root: Element): HTMLElement[] {
  const items: HTMLElement[] = [];
  const visit = (element: Element) => {
    if (element instanceof HTMLElement && (element.hidden || element.inert || element.matches(":disabled"))) return;
    if (element instanceof HTMLElement && element.tabIndex >= 0 && element.getClientRects().length && getComputedStyle(element).visibility !== "hidden") items.push(element);
    const children = element instanceof HTMLSlotElement ? element.assignedElements({ flatten: true }) : element.shadowRoot ? element.shadowRoot.children : element.children;
    for (const child of Array.from(children)) visit(child);
  };
  visit(root);
  return items;
}

/** Coordinates modal focus, background inertness, scroll locking, and Escape. */
export class OverlayController {
  component: JBPopoverWebComponent;
  #requestClose: () => void;
  #listeners?: AbortController;
  #returnFocus: HTMLElement | null = null;
  /** in desktop we are not modal so we don't need to manage overlay */
  #modal = false;
  #redirecting = false;
  constructor(component: JBPopoverWebComponent, requestClose: () => void) {
    this.component = component;
    this.#requestClose = requestClose;
  }
  get isTopmost() {
    return stack[stack.length - 1] === this;
  }
  /** to support nesting popover we extract all popover opened after us (we consider them nested popover)*/
  #allowed() {
    return stack.slice(stack.indexOf(this)).map(item => item.component);
  }
  /** are we last modal (except desktop) */
  #isActiveModal() {
    return stack.filter(item => item.#modal).pop() === this;
  }
  open() {
    if (stack.includes(this)) {
      this.sync();
      return;
    }
    this.#returnFocus = activeElement();
    stack.push(this);
    this.#listeners = new AbortController();
    document.addEventListener("keydown", this.#onKey, { signal: this.#listeners.signal });
    document.addEventListener("focusin", this.#onFocus, { signal: this.#listeners.signal });
    this.sync();
  }
  sync() {
    const wasModal = this.#modal;
    this.#modal = this.component.modal === "auto" ? this.component.isMobileMode : this.component.modal;
    const content = this.component.elements.contentWrapper;
    if (this.#modal) {
      content.setAttribute("role", "dialog");
      content.setAttribute("aria-modal", "true");
      const label = this.component.getAttribute("aria-label");
      if (label) content.setAttribute("aria-label", label);
      else content.removeAttribute("aria-label");
      if (!wasModal && !contains(this.component, activeElement())){
        // if any element inside popover has autoFocus we will focus on it.
        (focusable(this.component).find(element => element.hasAttribute("autofocus")) ?? content).focus({ preventScroll: true });

      }
    } else {
      content.removeAttribute("role");
      content.removeAttribute("aria-modal");
      content.removeAttribute("aria-label");
    }
    this.#updateBackground();
  }
  close(restoreFocus = true) {
    const index = stack.indexOf(this);
    const wasTop = this.isTopmost;
    if (index !== -1) stack.splice(index, 1);
    this.#listeners?.abort();
    this.#modal = false;
    this.#updateBackground();
    if (restoreFocus && this.component.restoreFocus && wasTop && this.#returnFocus?.isConnected) this.#returnFocus.focus({ preventScroll: true });
    this.#returnFocus = null;
  }
  #onKey = (event: KeyboardEvent) => {
    if (event.defaultPrevented) return;
    if (event.key === "Escape" && this.isTopmost && this.component.closeOnEscape) {
      event.preventDefault();
      this.#requestClose();
    } else if (event.key === "Tab" && this.#isActiveModal()) {
      const targets = this.#allowed().flatMap(focusable);
      const index = targets.indexOf(activeElement()!);
      if (!targets.length || (event.shiftKey ? index <= 0 : index === targets.length - 1 || index === -1)) {
        event.preventDefault();
        (event.shiftKey ? targets[targets.length - 1] : targets[0])?.focus();
        if (!targets.length) this.component.elements.contentWrapper.focus({ preventScroll: true });
      }
    }
  };
  #onFocus = (event: FocusEvent) => {
    if (this.#redirecting || !this.#isActiveModal() || this.#allowed().some(element => event.composedPath().includes(element))) return;
    this.#redirecting = true;
    this.component.elements.contentWrapper.focus({ preventScroll: true });
    this.#redirecting = false;
  };
  #updateBackground() {
    for (const [element, inert] of inertElements) element.inert = inert;
    inertElements.clear();
    const modal = stack.filter(item => item.#modal).pop();
    if (!modal) {
      restoreScroll?.();
      restoreScroll = undefined;
      return;
    }
    if (!restoreScroll) {
      const body = document.body;
      const html = document.documentElement;
      const x = window.scrollX,
        y = window.scrollY;
      const properties = ["position", "top", "left", "width"];
      const saved = properties.map(property => [property, body.style.getPropertyValue(property), body.style.getPropertyPriority(property)]);
      const overflow = [html.style.getPropertyValue("overflow"), html.style.getPropertyPriority("overflow")];
      html.style.overflow = "hidden";
      Object.assign(body.style, { position: "fixed", top: `${-y}px`, left: `${-x}px`, width: "100%" });
      restoreScroll = () => {
        for (const [property, value, priority] of saved) body.style.setProperty(property, value, priority);
        html.style.setProperty("overflow", overflow[0], overflow[1]);
        window.scrollTo(x, y);
      };
    }
    const allowed = modal.#allowed();
    let element: Element | null = modal.component;
    while (element) {
      const parent = getComposedParent(element);
      if (!parent) break;
      // Traverse the actual sibling tree, including siblings inside shadow roots.
      const siblings = element.parentNode?.children ?? [];
      for (const sibling of Array.from(siblings)) {
        if (!(sibling instanceof HTMLElement) || sibling === element || allowed.some(item => contains(sibling, item))) continue;
        inertElements.set(sibling, sibling.inert);
        sibling.inert = true;
      }
      element = parent;
    }
  }
}

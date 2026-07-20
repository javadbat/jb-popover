import CSS from "./jb-popover.css";
import VariablesCSS from "./variables.css";
import { renderHTML } from "./render";
import type { ElementsObject, PositionArea } from "./types.js";
import { isMobile } from "jb-core";
import { registerDefaultVariables } from 'jb-core/theme';
import { getScrollParent } from "./utils";

export * from './types.js';
// TODO: in mobile ut should prevent background scroll (jb-time-input works really bad in this situation)
export class JBPopoverWebComponent extends HTMLElement {
  #isOpen = false;
  #internals?: ElementInternals;
  #JBID = Symbol("JBID");
  elements!: ElementsObject;
  get JBID() {
    return this.#JBID;
  }
  #autoCloseOnBackgroundClick = true;
  get isOpen() {
    return this.#isOpen;
  }
  get PopoverHashPath(): string | null {
    //this used to add # route to prevent back button in mobile. it only work if element have id
    return this.id ? `#${this.id}` : null;
  }
  #positionArea: PositionArea = { inline: 'start', block: 'after' }
  get positionArea() {
    return this.#positionArea;
  }
  set positionArea(value: Partial<PositionArea>) {
    Object.assign(this.#positionArea, value);
    this.#updatePos();
  }
  constructor() {
    super();
    if (typeof this.attachInternals == "function") {
      this.#internals = this.attachInternals();
      this.#internals.ariaHidden = "true";
    }
    this.initWebComponent();
  }
  connectedCallback() {
    // standard web component event that called when all of dom is bound
    this.callOnLoadEvent();
    this.#registerEventListener();
    this.checkInitialOpenness();
    this.callOnInitEvent();
  }
  disconnectedCallback() {
    window.removeEventListener("popstate", this.#onBrowserBack);
  }
  callOnLoadEvent() {
    const event = new CustomEvent("load", { bubbles: false, composed: false });
    this.dispatchEvent(event);
  }
  callOnInitEvent() {
    const event = new CustomEvent("init", { bubbles: false, composed: false });
    this.dispatchEvent(event);
  }
  initWebComponent() {
    const shadowRoot = this.attachShadow({
      mode: "open",
      clonable: true,
      serializable: true
    });
    registerDefaultVariables();
    const html = `<style>${VariablesCSS} ${CSS}</style>\n${renderHTML()}`;
    const element = document.createElement("template");
    element.innerHTML = html;
    shadowRoot.appendChild(element.content.cloneNode(true));
    this.elements = {
      componentWrapper: shadowRoot.querySelector(".jb-popover-web-component")!,
      background: shadowRoot.querySelector(".popover-background")!,
      contentWrapper: shadowRoot.querySelector(".popover-content-wrapper")!,
    };
  }
  #registerEventListener() {
    this.elements.background.addEventListener("click",this.onBackgroundClick.bind(this),{passive:true});
    //we add popstate event listener
    this.elements.contentWrapper.addEventListener('mouseenter', this.#fixContainerPos, {passive:true});
    this.elements.contentWrapper.addEventListener('mouseleave', this.#resetContainerPos, {passive:true});
  }
  checkInitialOpenness() {
    //if page has modal url we open it automatically
    const location = window.location;
    if (location.hash === `#${this.id}`) {
      this.triggerUrlOpenEvent();
      this.open();
    }
  }
  triggerUrlOpenEvent() {
    //when modal open itself because url contain modal id
    const event = new CustomEvent("urlOpen", { bubbles: true, composed: true });
    this.dispatchEvent(event);
  }
  static get observedAttributes() {
    return ["is-open", "id"];
  }
  attributeChangedCallback(name: string, _oldValue: string | null, newValue: string | null) {
    // do something when an attribute has changed
    this.onAttributeChange(name, newValue);
  }
  onAttributeChange(name: string, value: string | null) {
    switch (name) {
      case "is-open":
        if (value === "true") {
          if (!this.#isOpen) {
            this.open();
          }
        } else {
          if (this.#isOpen) {
            this.close();
          }
        }
        break;
      case "id":
        // The browser already synchronizes the id property with the attribute.
        break;
    }
  }
  onBackgroundClick() {
    this.#dispatchCloseEvent("BACKGROUND_CLICK");
    if (this.#autoCloseOnBackgroundClick) {
      this.close();
    }
  }
  #dispatchCloseEvent(type: "BACKGROUND_CLICK" | "HISTORY_BACK_EVENT" | "OUTSIDE_CLICK" | "CLOSE_BUTTON_CLICK") {
    //we have many ways to dispatch close event like back button on close clicked
    const event = new CustomEvent("close", { detail: { eventType: type } });
    this.dispatchEvent(event);
  }
  /**
   * @public
   * will close popover
   */
  close() {
    this.#isOpen = false;
    if (this.#internals) this.#internals.ariaHidden = "true";
    this.#internals?.states?.delete("open");
    /* remove place observer when menu closed */
    this.#bindTargetObserverController?.abort();
    this.#bindTargetObserverController = null;
    this.elements.componentWrapper.classList.remove("--opened");
    this.elements.componentWrapper.classList.add("--closed");
    // if we pushed state to the history but state doesn't popped yet we pop it.
    if (window.history.state === "jb-popover-open" && this.PopoverHashPath !== null) {
      window.removeEventListener("popstate", this.#onBrowserBack);
      if (window.location.hash === this.PopoverHashPath) {
        history.go(-1);
      }
    }
  }
  /**
   * @public
   * will open popover
   */
  open() {
    this.#isOpen = true;
    if (this.#internals) this.#internals.ariaHidden = "false";
    this.#internals?.states?.add("open");
    this.#updatePos();
    this.#observeBindTarget();
    this.elements.componentWrapper.classList.remove("--closed");
    this.elements.componentWrapper.classList.add("--opened");
    if (isMobile() && this.PopoverHashPath !== null) {
      window.history.pushState('jb-popover-open', "", this.PopoverHashPath);
      window.addEventListener("popstate", this.#onBrowserBack, { once: true });
    }
  }
  #bindTarget: HTMLElement | null = null;
  #bindTargetObserverController: AbortController | null = null;
  /**
   * will bind certain dom to the popover. when you bind something it get position fix and move base on target dom position on the page. it will solve overflow problem on some modal pr container with scroll.
   */
  bindTarget(element: HTMLElement) {
    this.#bindTarget = element;
    this.#updatePos();
  }
  /**
   * will unbind bounded target by `bindTarget` method. 
   */
  unBindTarget() {
    this.#bindTarget = null;
    this.#bindTargetObserverController?.abort();
    this.#updatePos();
  }
  #observeBindTarget() {
    if (!this.#bindTarget || isMobile()) return;
    let lastPos = this.#bindTarget.getBoundingClientRect();
    const checkPosChange = () => {
      const pos = this.#bindTarget!.getBoundingClientRect();
      if (lastPos.x !== pos.x || lastPos.y !== pos.y || pos.width !== lastPos.width) {
        this.#updatePos();
        lastPos = pos;
      }
    }

    this.#bindTargetObserverController = new AbortController();
    const scrollableParent = getScrollParent(this.#bindTarget);
    //init listeners
    scrollableParent?.addEventListener("scroll", checkPosChange, { signal: this.#bindTargetObserverController.signal, passive: true })
    window.addEventListener("scroll", checkPosChange, { signal: this.#bindTargetObserverController.signal, passive: true })
    window.addEventListener("resize", checkPosChange, { signal: this.#bindTargetObserverController.signal, passive: true })
    //init observers
    const resizeObserver = new ResizeObserver(() => {
      checkPosChange();
    });
    this.#bindTargetObserverController.signal.addEventListener("abort", () => resizeObserver.disconnect());
    resizeObserver.observe(this.#bindTarget, { box: "border-box" });
    if (this.#bindTarget?.parentElement) {
      resizeObserver.observe(this.#bindTarget.parentElement, { box: "border-box" })
    }
  }
  #getContentBoundary() {
    this.elements.componentWrapper.classList.add("--fake-opened");
    const popoverBoundary = this.elements.contentWrapper.getBoundingClientRect();
    this.elements.componentWrapper.classList.remove("--fake-opened");
    return popoverBoundary;
  }
  #updatePos() {
    if (this.#bindTarget && !isMobile()) {
      const bindTargetBoundary = this.#bindTarget.getBoundingClientRect();
      const popoverBoundary = this.#getContentBoundary();
      const style = getComputedStyle(this.#bindTarget);
      const direction = style.direction;
      this.elements.componentWrapper.style.position = "fixed";
      // y pos
      if (this.#positionArea.block === "after") {
        this.elements.componentWrapper.style.insetBlockStart = `${bindTargetBoundary.bottom}px`;
        this.elements.componentWrapper.style.insetBlockEnd = "unset";
      } else {
        this.elements.componentWrapper.style.insetBlockStart = "unset";
        this.elements.componentWrapper.style.insetBlockEnd = `${window.innerHeight - bindTargetBoundary.top}px`;
      }
      // x pos
      switch (this.positionArea.inline) {
        case "start":
          this.elements.componentWrapper.style.insetInlineStart = (direction === "ltr" ? `${bindTargetBoundary.left}px` : `${window.innerWidth - bindTargetBoundary.right}px`);
          this.elements.componentWrapper.style.insetInlineEnd = "unset";
          break;
        case "end":
          this.elements.componentWrapper.style.insetInlineStart = 'unset';
          this.elements.componentWrapper.style.insetInlineEnd = (direction === "ltr" ? `${window.innerWidth - bindTargetBoundary.right}px` : `${bindTargetBoundary.left}px`);
          break;
        case "center":
          this.elements.componentWrapper.style.insetInlineStart = `${((direction === "ltr"?bindTargetBoundary.right:(window.innerWidth-bindTargetBoundary.left)) - (bindTargetBoundary.width / 2))- popoverBoundary.width/2}px`
            this.elements.componentWrapper.style.insetInlineEnd = "unset";
          break;
        case "center-before":
          this.elements.componentWrapper.style.insetInlineStart = 'unset'
          this.elements.componentWrapper.style.insetInlineEnd = `${(direction === "ltr"?(window.innerWidth - bindTargetBoundary.left):bindTargetBoundary.left) - (bindTargetBoundary.width / 2)}px`;
          break;
        case "center-after":
          this.elements.componentWrapper.style.insetInlineStart = `${(direction === "ltr"?bindTargetBoundary.left:(window.innerWidth-bindTargetBoundary.left)) + (bindTargetBoundary.width / 2)}px`
          this.elements.componentWrapper.style.insetInlineEnd = "unset";
          break;
      }
    } else {
      this.elements.componentWrapper.style.removeProperty('position');
      this.elements.componentWrapper.style.removeProperty('top');
      this.elements.componentWrapper.style.removeProperty('insetInlineStart');
    }
  }
  #onBrowserBack = (_e: PopStateEvent) => {
    if (this.isOpen && isMobile()) {
      //we will push state when modal get open
      this.close();
      this.#dispatchCloseEvent("HISTORY_BACK_EVENT");

    }
  }
  overflowHandler: "NONE" | "SLIDE" = "NONE";
  overflowDom: HTMLElement | null = null;
  #resetContainerPos = () => {
    if (this.overflowHandler === "SLIDE") {
      this.elements.contentWrapper.style.transform = `translateY(${0}px)`;
    }
  }
  #fixContainerPos = () => {
    if (this.overflowHandler === "SLIDE") {
      //bounding client rect
      const bcr = this.elements.contentWrapper.getBoundingClientRect();
      const overflowSize = this.#getParentBottom() - bcr.bottom;
      if (overflowSize < 0) {
        this.elements.contentWrapper.style.transform = `translateY(${overflowSize}px)`;
      }
    }

  }
  /**
   * @description return height of element that we want to calc our overflow based on.
   */
  #getParentBottom(): number {
    if (this.overflowDom) {
      return this.overflowDom.getBoundingClientRect().bottom;
    }
    //default height of parent if no parent set
    return window.innerHeight;
  }
}
const myElementNotExists = !customElements.get("jb-popover");
if (myElementNotExists) {
  window.customElements.define("jb-popover", JBPopoverWebComponent);
}

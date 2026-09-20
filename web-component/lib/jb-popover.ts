import { defineWebComponent, JBBaseComponent, parseBooleanAttribute } from "jb-core";
import { breakPoints, registerDefaultVariables } from "jb-core/theme";
import { cloneTemplate } from "./template.js";
import { GestureController } from "./gesture-controller.js";
import { PositionController } from "./position-controller.js";
import { HistoryController } from "./history-controller.js";
import { OverlayController } from "./overlay-controller.js";
import type { ElementsObject, PositionArea, JBPopoverCloseEventType } from "./types.js";

export * from "./types.js";

export class JBPopoverWebComponent extends JBBaseComponent {
  #isOpen = false;
  #internals?: ElementInternals;
  #JBID = Symbol("JBID");
  elements!: ElementsObject;
  swipeToClose = true;
  dragFromContent = false;
  autoCloseOnBackgroundClick = true;
  closeOnEscape = true;
  /** Opt in when returning focus will not reopen a focus-triggered consumer. */
  restoreFocus = false;
  #modal: boolean | "auto" = "auto";
  #autoPlacement = true;
  #positionArea: PositionArea = { inline: "start", block: "after" };
  #mobileQuery: MediaQueryList;
  #sheetQuery: MediaQueryList;
  #listeners?: AbortController;
  #openListeners?: AbortController;
  #viewportFrame: number | null = null;
  /** observe that last time modal get open is it was in mobile mode or not so if it change it can react */
  #lastMobile = false;
  #gestureController: GestureController;
  #positionController: PositionController;
  #historyController: HistoryController;
  #overlayController: OverlayController;

  constructor() {
    super();
    if (typeof this.attachInternals === "function") {
      this.#internals = this.attachInternals();
      this.#internals.ariaHidden = "true";
    }
    this.#mobileQuery = window.matchMedia(`(max-width: ${breakPoints.md / 16}rem)`);
    this.#sheetQuery = window.matchMedia(`(max-width: ${breakPoints.sm / 16}rem)`);
    this.initWebComponent();
    this.elements.componentWrapper.classList.add("--auto-placement");
    this.#positionController = new PositionController(this);
    this.#gestureController = new GestureController(this, () => this.#requestClose("SWIPE_DOWN"), this.#finishClose);
    this.#historyController = new HistoryController(this, () => {
      this.close();
      this.#dispatchCloseEvent("HISTORY_BACK_EVENT");
    });
    this.#overlayController = new OverlayController(this, () => {
      if (this.#requestClose("ESCAPE_KEY")) this.close();
    });
  }
  get JBID() {
    return this.#JBID;
  }
  get isOpen() {
    return this.#isOpen;
  }
  get isMobileMode() {
    return this.#mobileQuery.matches;
  }
  get isBottomSheet() {
    return this.#sheetQuery.matches;
  }
  get PopoverHashPath(): string | null {
    return this.id ? `#${this.id}` : null;
  }
  get modal() {
    return this.#modal;
  }
  set modal(value: boolean | "auto") {
    this.#modal = value;
    if (this.isOpen && this.isConnected) this.#overlayController.sync();
  }
  get autoPlacement() {
    return this.#autoPlacement;
  }
  set autoPlacement(value: boolean) {
    this.#autoPlacement = value;
    this.elements.componentWrapper.classList.toggle("--auto-placement", value);
    this.#positionController.update();
  }
  get positionArea(): PositionArea {
    return this.#positionArea;
  }
  set positionArea(value: Partial<PositionArea>) {
    if (value.inline !== undefined) this.#positionArea.inline = value.inline;
    if (value.block !== undefined) this.#positionArea.block = value.block;
    this.#positionController.update();
  }
  connectedCallback() {
    this.callOnLoadEvent();
    this.#listeners?.abort();
    this.#listeners = new AbortController();
    const signal = this.#listeners.signal;
    this.elements.componentWrapper.addEventListener("click", this.onBackgroundClick, { passive: true, signal });
    this.elements.contentWrapper.addEventListener("mouseenter", this.#fixContainerPos, { passive: true, signal });
    this.elements.contentWrapper.addEventListener("mouseleave", this.#resetContainerPos, { passive: true, signal });
    this.#gestureController.connect();
    if (this.isOpen) this.#activate();
    else this.checkInitialOpenness();
    this.callOnInitEvent();
  }
  disconnectedCallback() {
    this.#listeners?.abort();
    this.#stopOpenListeners();
    this.#positionController.stop();
    this.#gestureController.disconnect();
    this.#overlayController.close(false);
    this.#historyController.release(false);
  }
  callOnLoadEvent() {
    this.dispatchEvent(new CustomEvent("load"));
  }
  callOnInitEvent() {
    this.dispatchEvent(new CustomEvent("init", { composed: false }));
  }
  initWebComponent() {
    const shadow = this.attachShadow({ mode: "open", clonable: true, serializable: true });
    registerDefaultVariables();
    shadow.appendChild(cloneTemplate());
    this.elements = {
      componentWrapper: shadow.querySelector(".jb-popover-web-component")!,
      contentWrapper: shadow.querySelector(".popover-content")!,
      backdrop: shadow.querySelector(".popover-backdrop")!,
      handle: shadow.querySelector(".drag-handle")!,
    };
  }
  checkInitialOpenness() {
    if (this.id && location.hash === this.PopoverHashPath) {
      this.triggerUrlOpenEvent();
      this.open();
    }
  }
  triggerUrlOpenEvent() {
    this.dispatchEvent(new CustomEvent("url-open", { bubbles: true, composed: true }));
  }
  static get observedAttributes() {
    return ["is-open", "id", "aria-label"];
  }
  attributeChangedCallback(name: string, _oldValue: string | null, newValue: string | null) {
    this.onAttributeChange(name, newValue);
  }
  onAttributeChange(name: string, value: string | null) {
    if (name === "is-open") {
      if (parseBooleanAttribute(value)) this.open();
      else this.close();
    } else if (name === "id" && this.isOpen) {
      this.#historyController.release(false);
      this.#historyController.sync();
    } else if (name === "aria-label" && this.isOpen && this.isConnected) this.#overlayController.sync();
  }
  onBackgroundClick = (event: MouseEvent) => {
    if (!this.isOpen || !this.isMobileMode || !this.#overlayController.isTopmost || event.composedPath().includes(this.elements.contentWrapper)) return;
    if (this.#requestClose("BACKGROUND_CLICK") && this.autoCloseOnBackgroundClick) this.close();
  };
  #requestClose(type: "BACKGROUND_CLICK" | "SWIPE_DOWN" | "ESCAPE_KEY") {
    if (this.#gestureController.isClosing) return false;
    if (!this.dispatchEvent(new CustomEvent("cancel", { bubbles: true, composed: true, cancelable: true, detail: { eventType: type } }))) return false;
    return this.#dispatchCloseEvent(type);
  }
  #dispatchCloseEvent(type: JBPopoverCloseEventType) {
    return this.dispatchEvent(new CustomEvent("close", { bubbles: true, composed: true, cancelable: true, detail: { eventType: type } }));
  }
  /** Animate dismissal. isOpen becomes false and closed fires when it finishes. */
  close() {
    if (!this.isOpen) return;
    if (!this.isConnected) {
      this.#finishClose();
      return;
    }
    this.#gestureController.close();
  }
  #finishClose = () => {
    if (!this.#isOpen) return;
    this.#isOpen = false;
    if (this.#internals) this.#internals.ariaHidden = "true";
    this.#internals?.states?.delete("open");
    this.#stopOpenListeners();
    this.#positionController.stop();
    this.#overlayController.close();
    this.#historyController.release();
    this.dispatchEvent(new CustomEvent("closed", { bubbles: true, composed: true }));
  };
  /** Open, or interrupt a pending dismissal without creating another history entry. */
  open() {
    this.#gestureController.reset();
    if (this.#isOpen) return;
    this.#isOpen = true;
    if (this.#internals) this.#internals.ariaHidden = "false";
    this.#internals?.states?.add("open");
    if (this.isConnected) this.#activate();
  }
  #activate() {
    this.#stopOpenListeners();
    this.#openListeners = new AbortController();
    const signal = this.#openListeners.signal;
    window.addEventListener("resize", this.#scheduleViewport, { passive: true, signal });
    window.visualViewport?.addEventListener("resize", this.#scheduleViewport, { passive: true, signal });
    window.visualViewport?.addEventListener("scroll", this.#scheduleViewport, { passive: true, signal });
    this.#lastMobile = this.isMobileMode;
    this.#overlayController.open();
    this.#updateViewport();
    this.#positionController.observe();
    this.#positionController.update();
    this.#historyController.sync();
  }
  #stopOpenListeners() {
    this.#openListeners?.abort();
    if (this.#viewportFrame !== null) cancelAnimationFrame(this.#viewportFrame);
    this.#viewportFrame = null;
  }
  /**
   * called by events that may change popover position
   */
  #scheduleViewport = () => {
    if (!this.isOpen || this.#viewportFrame !== null) return;
    this.#viewportFrame = requestAnimationFrame(() => {
      this.#viewportFrame = null;
      this.#gestureController.viewportChanged();
      if (!this.isOpen) return;
      this.#updateViewport();
      if (this.#lastMobile !== this.isMobileMode) {
        this.#lastMobile = this.isMobileMode;
        this.#overlayController.sync();
        this.#positionController.observe();
      }
      this.#positionController.update();
      this.#historyController.sync();
    });
  };
  #updateViewport() {
    const viewport = window.visualViewport;
    const style = this.elements.componentWrapper.style;
    style.setProperty("--viewport-height", `${viewport?.height ?? window.innerHeight}px`);
    style.setProperty("--viewport-width", `${viewport?.width ?? window.innerWidth}px`);
    style.setProperty("--viewport-top", `${viewport?.offsetTop ?? 0}px`);
    style.setProperty("--viewport-left", `${viewport?.offsetLeft ?? 0}px`);
  }
  bindTarget(element: HTMLElement) {
    this.#positionController.bind(element);
  }
  unBindTarget() {
    this.#positionController.bind(null);
  }

  /** Legacy hover-only overflow correction; automatic placement is preferred. */
  overflowHandler: "NONE" | "SLIDE" = "NONE";
  overflowDom: HTMLElement | null = null;
  #resetContainerPos = () => {
    if (!this.isMobileMode && this.overflowHandler === "SLIDE") this.elements.contentWrapper.style.removeProperty("transform");
  };
  #fixContainerPos = () => {
    if (!this.isMobileMode && this.overflowHandler === "SLIDE") {
      const content = this.elements.contentWrapper;
      const bottom = this.overflowDom?.getBoundingClientRect().bottom ?? window.innerHeight;
      const overflow = bottom - content.getBoundingClientRect().bottom;
      if (overflow < 0) content.style.transform = `translateY(${overflow}px)`;
    }
  };
}
defineWebComponent("jb-popover", JBPopoverWebComponent);
declare global {
  interface HTMLElementTagNameMap {
    "jb-popover": JBPopoverWebComponent;
  }
}

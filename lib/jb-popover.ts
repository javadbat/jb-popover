import { symbol } from "prop-types";
import HTML from "./jb-popover.html";
import CSS from "./jb-popover.scss";
import { ElementsObject } from "./types";
import { isMobile } from "../../../common/scripts/device-detection";

export class JBPopoverWebComponent extends HTMLElement {
  #isOpen = false;
  #JBID = Symbol();
  elements: ElementsObject;
  get JBID() {
    return this.#JBID;
  }
  #autoCloseOnBackgroundClick= false;
  get isOpen() {
    return this.#isOpen;
  }
  constructor() {
    super();
    this.initWebComponent();
  }
  connectedCallback() {
    // standard web component event that called when all of dom is bound
    this.callOnLoadEvent();
    this.initProp();
    this.callOnInitEvent();
  }
  callOnLoadEvent() {
    const event = new CustomEvent("load", { bubbles: true, composed: true });
    this.dispatchEvent(event);
  }
  callOnInitEvent() {
    const event = new CustomEvent("init", { bubbles: true, composed: true });
    this.dispatchEvent(event);
  }
  initWebComponent() {
    const shadowRoot = this.attachShadow({
      mode: "open",
    });
    const html = `<style>${CSS}</style>` + "\n" + HTML;
    const element = document.createElement("template");
    element.innerHTML = html;
    shadowRoot.appendChild(element.content.cloneNode(true));
    this.elements = {
      componentWrapper: shadowRoot.querySelector(".jb-popover-web-component")!,
      background: shadowRoot.querySelector(".popover-background")!,
      contentWrapper: shadowRoot.querySelector(".popover-content-wrapper")!,
    };
  }
  registerEventListener() {
    this.elements.background.addEventListener(
      "click",
      this.onBackgroundClick.bind(this)
    );
    //TODO: remove listener on component unmount
    window.addEventListener("popstate", this.#onBrowserBack.bind(this));
  }
  initProp() {
    this.registerEventListener();
  }
  checkInitialOpenness() {
    //if page has modal url we open it automatically
    const location = window.location;
    if (location.hash == `#${this.id}`) {
      this.triggerUrlOpenEvent();
      this.open();
    }
  }
  triggerUrlOpenEvent() {
    //when modal open itself becuase url contain modal id
    const event = new CustomEvent("urlOpen", { bubbles: true, composed: true });
    this.dispatchEvent(event);
  }
  static get observedAttributes() {
    return ["is-open", "id"];
  }
  attributeChangedCallback(name:string, oldValue:string, newValue:string) {
    // do something when an attribute has changed
    this.onAttributeChange(name, newValue);
  }
  onAttributeChange(name:string, value:string) {
    switch (name) {
      case "is-open":
        if (value == "true") {
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
        this.id = value;
        break;
    }
  }
  onBackgroundClick() {
    this.#dispatchCloseEvent("BACKGROUND_CLICK");
    if (this.#autoCloseOnBackgroundClick) {
      this.close();
    }
  }
  #dispatchCloseEvent(type:"BACKGROUND_CLICK" | "HISTORY_BACK_EVENT" | "OUTSIDE_CLICK" | "CLOSE_BUTTON_CLICK") {
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
    this.elements.componentWrapper.classList.remove("--opened");
    this.elements.componentWrapper.classList.add("--closed");
  }
  /**
   * @public
   * will open popover
   */
  open() {
    this.#isOpen = true;
    this.elements.componentWrapper.classList.remove("--closed");
    this.elements.componentWrapper.classList.add("--opened");
  }
  #onBrowserBack() {
    if ( this.isOpen && isMobile()) {
      this.close();
      this.#dispatchCloseEvent("HISTORY_BACK_EVENT");
    }
  }
}
const myElementNotExists = !customElements.get("jb-popover");
if (myElementNotExists) {
  window.customElements.define("jb-popover", JBPopoverWebComponent);
}

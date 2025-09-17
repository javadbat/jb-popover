import CSS from "./jb-popover.css";
import VariablesCSS from "./variables.css";
import { renderHTML } from "./render";
import { ElementsObject } from "./types.js";
import { isMobile } from "jb-core";
import {registerDefaultVariables} from 'jb-core/theme';

export * from './types.js';
export class JBPopoverWebComponent extends HTMLElement {
  #isOpen = false;
  #JBID = Symbol();
  elements: ElementsObject;
  get JBID() {
    return this.#JBID;
  }
  #autoCloseOnBackgroundClick = true;
  get isOpen() {
    return this.#isOpen;
  }
  get PopoverHashPath():string | null{
    //this used to add # route to prevent back button in mobile. it only work if element have id
    return this.id?`#${this.id}`:null;
  }
  constructor() {
    super();
    this.initWebComponent();
  }
  connectedCallback() {
    // standard web component event that called when all of dom is bound
    this.callOnLoadEvent();
    this.#registerEventListener();
    this.callOnInitEvent();
  }
  disconnectedCallback() {
    window.removeEventListener("popstate", this.#onBrowserBack);
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
    registerDefaultVariables();
    const html = `<style>${CSS} ${VariablesCSS}</style>` + "\n" + renderHTML();
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
    this.elements.background.addEventListener(
      "click",
      this.onBackgroundClick.bind(this)
    );
    //we add popstate event listener
    this.elements.contentWrapper.addEventListener('mouseenter', this.#fixCalendarContainerPos);
    this.elements.contentWrapper.addEventListener('mouseleave', this.#resetCalendarContainerPos);
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
  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    // do something when an attribute has changed
    this.onAttributeChange(name, newValue);
  }
  onAttributeChange(name: string, value: string) {
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
    this.elements.componentWrapper.classList.remove("--opened");
    this.elements.componentWrapper.classList.add("--closed");
    // if we pushed state to the history but state doesn't popped yet we pop it.
    if(window.history.state == "jb-popover-open" && this.PopoverHashPath !== null){
      window.removeEventListener("popstate", this.#onBrowserBack);
      if(window.location.hash == this.PopoverHashPath){
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
    this.elements.componentWrapper.classList.remove("--closed");
    this.elements.componentWrapper.classList.add("--opened");
    if (isMobile() && this.PopoverHashPath !== null) {
      window.history.pushState('jb-popover-open',"",this.PopoverHashPath);
      window.addEventListener("popstate", this.#onBrowserBack,{once:true});
    }
  }
  #onBrowserBack = (e: PopStateEvent) => {
    if (this.isOpen && isMobile()) {
      //we will push state when modal get open
      this.close();
      this.#dispatchCloseEvent("HISTORY_BACK_EVENT");

    }
  }
  overflowHandler: "NONE" | "SLIDE" = "NONE";
  overflowDom:HTMLElement|null = null;
  #resetCalendarContainerPos = () => {
    if (this.overflowHandler == "SLIDE") {
      this.elements.contentWrapper.style.transform = `translateY(${0}px)`;
    }
  }
  #fixCalendarContainerPos = () => {
    if (this.overflowHandler == "SLIDE") {
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
  #getParentBottom():number{
    if(this.overflowDom){
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

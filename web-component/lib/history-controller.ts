import type { JBPopoverWebComponent } from "./jb-popover.js";

const marker = "__jbPopover";
let nextOwner = 0;

/** Owns only entries created by this instance; never overwrites router state. */
export class HistoryController {
  #component: JBPopoverWebComponent;
  #onBack: () => void;
  #owner = `popover-${Date.now()}-${++nextOwner}`;
  #owned = false;
  #pendingBack = false;
  #previousState: unknown;
  #previousUrl = "";
  #hash = "";
  constructor(component: JBPopoverWebComponent, onBack: () => void) {
    this.#component = component;
    this.#onBack = onBack;
  }
  sync() {
    if (this.#pendingBack || this.#owned || !this.#component.isOpen || !this.#component.isConnected || !this.#component.isMobileMode || !this.#component.id) return;
    this.#hash = this.#component.PopoverHashPath!;
    // A deep link already represents this state; do not push the same URL again.
    if (window.location.hash === this.#hash) return;
    this.#previousState = history.state;
    this.#previousUrl = location.href;
    const state = history.state && typeof history.state === "object" ? history.state : {};
    history.pushState({ ...state, [marker]: this.#owner }, "", this.#hash);
    this.#owned = true;
    window.addEventListener("popstate", this.#onPop);
  }
  #onPop = () => {
    if (this.#pendingBack) {
      this.#pendingBack = false;
      window.removeEventListener("popstate", this.#onPop);
      this.sync();
    } else if (this.#owned && history.state?.[marker] !== this.#owner) {
      this.#owned = false;
      window.removeEventListener("popstate", this.#onPop);
      this.#onBack();
    }
  };
  release(navigate = true) {
    if (!this.#owned) return;
    this.#owned = false;
    if (history.state?.[marker] === this.#owner && location.hash === this.#hash) {
      if (navigate) {
        this.#pendingBack = true;
        history.back();
        return;
      }
      // Detaching an element must not navigate the application.
      history.replaceState(this.#previousState, "", this.#previousUrl);
    }
    window.removeEventListener("popstate", this.#onPop);
  }
}

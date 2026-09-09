import type { EventTypeWithTarget } from "jb-core";
import type { JBPopoverWebComponent } from "./jb-popover";

export type ElementsObject = {
  componentWrapper: HTMLDivElement;
  backdrop: HTMLDivElement;
  handle: HTMLDivElement;
  contentWrapper: HTMLDivElement;
};

export type PositionInlineArea = "start" | "end" | "center" | "center-after" | "center-before";
export type PositionBlockArea = "after" | "before";
export type PositionArea = { inline: PositionInlineArea; block: PositionBlockArea };

export type JBPopoverEventType<TEvent> = EventTypeWithTarget<TEvent, JBPopoverWebComponent>;
export type JBPopoverCloseEventType = "BACKGROUND_CLICK" | "HISTORY_BACK_EVENT" | "OUTSIDE_CLICK" | "CLOSE_BUTTON_CLICK" | "SWIPE_DOWN" | "ESCAPE_KEY";
export type JBPopoverCloseEvent = JBPopoverEventType<CustomEvent<{ eventType: JBPopoverCloseEventType }>>;

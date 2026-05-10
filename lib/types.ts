import type { EventTypeWithTarget } from "jb-core"
import type { JBPopoverWebComponent } from "./jb-popover"

export type ElementsObject = {
  componentWrapper:HTMLDivElement,
  background:HTMLDivElement,
  contentWrapper:HTMLDivElement
}

export type PositionInlineArea = 'start' | 'end';
export type PositionBlockArea = 'after' | 'before';
export type PositionArea = {inline:PositionInlineArea, block:PositionBlockArea};

export type JBPopoverEventType<TEvent> = EventTypeWithTarget<TEvent,JBPopoverWebComponent>
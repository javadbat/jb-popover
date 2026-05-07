import type { EventTypeWithTarget } from "jb-core"
import type { JBPopoverWebComponent } from "./jb-popover"

export type ElementsObject = {
  componentWrapper:HTMLDivElement,
  background:HTMLDivElement,
  contentWrapper:HTMLDivElement
}

export type JBPopoverEventType<TEvent> = EventTypeWithTarget<TEvent,JBPopoverWebComponent>
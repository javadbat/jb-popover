import { useEvent } from "jb-core/react";
import type { RefObject } from "react";
import type { JBPopoverWebComponent, JBPopoverEventType } from 'jb-popover';

export type EventProps = {
  /**
   * when component loaded, in most cases component is already loaded before react mount so you dont need this but if you load web-component dynamically with lazy load it will be called after react mount
   */
  onLoad?: (e: JBPopoverEventType<CustomEvent>) => void,
  /**
  * when all property set and ready to use, in most cases component is already loaded before react mount so you dont need this but if you load web-component dynamically with lazy load it will be called after react mount
  */
  onInit?: (e: JBPopoverEventType<CustomEvent>) => void,
  onClose?: (e: JBPopoverEventType<CustomEvent>) => void,
}
export function useEvents(element: RefObject<JBPopoverWebComponent | null>, props: EventProps) {
  useEvent(element, 'load', props.onLoad, true);
  useEvent(element, 'init', props.onInit, true);
  useEvent(element, 'close', props.onClose);
}
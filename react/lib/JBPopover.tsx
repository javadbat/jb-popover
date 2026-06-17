'use client';
// biome-ignore lint/style/useImportType: <we need React import for some intra>
import React, { useEffect, useImperativeHandle, useRef } from 'react';
import 'jb-popover';
// eslint-disable-next-line no-duplicate-imports
import type { JBPopoverWebComponent, PositionArea } from 'jb-popover';
import { useEvents, type EventProps } from './events-hook.js';
import type { JBElementStandardProps } from 'jb-core/react';
import './module-declaration.js';
export const JBPopover = (props: Props) => {
  const element = useRef<JBPopoverWebComponent>(null);
  const { isOpen, anchor, children, onClose, onInit, ref, onLoad, overflowDom, overflowHandler, positionArea, ...otherProps } = props;

  // biome-ignore lint/correctness/useExhaustiveDependencies: <we need element to watch>
  useImperativeHandle(
    ref,
    () => (element?.current ?? undefined),
    [element],
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: <we need to react to ref>
  useEffect(() => {
    if (isOpen === true) {
      element.current?.open();
    } else {
      element.current?.close();
    }
  }, [isOpen, element.current]);

  useEffect(() => {
    if (element.current && positionArea) {
      element.current.positionArea = positionArea;
    }
  }, [positionArea, element.current]);

  useEffect(() => {
    if (element.current && overflowHandler) {
      element.current.overflowHandler = overflowHandler;
    }
  }, [overflowHandler, element.current]);

  useEffect(() => {
    if (element.current) {
      element.current.overflowDom = overflowDom ?? null;
    }
  }, [overflowDom, element.current]);

  useEffect(() => {
    if (anchor?.current) {
      element.current?.bindTarget(anchor.current)
    }
    return (() => element.current?.unBindTarget())
  }, [anchor])

  useEvents(element, { onClose, onInit, onLoad });

  return (
    <jb-popover ref={element} {...otherProps}>
      {children}
    </jb-popover>
  );
};

type PopoverProps = EventProps & React.PropsWithChildren<{
  isOpen?: boolean,
  anchor?: React.RefObject<HTMLElement | null>,
  positionArea?:Partial<PositionArea>,
  overflowHandler?: "NONE" | "SLIDE",
  overflowDom?: HTMLElement | null,
  ref?: React.ForwardedRef<JBPopoverWebComponent | null | undefined>
}>
export type Props = PopoverProps & JBElementStandardProps<JBPopoverWebComponent, keyof PopoverProps>

JBPopover.displayName = "JBPopover";

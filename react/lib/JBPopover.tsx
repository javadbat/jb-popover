"use client";
// biome-ignore lint/style/useImportType: This package uses the classic JSX transform.
import React from "react";
import { useEffect, useImperativeHandle, useRef } from "react";
import "jb-popover";
import type { JBPopoverWebComponent, PositionArea } from "jb-popover";
import { useEvents, type EventProps } from "./events-hook.js";
import type { JBElementStandardProps } from "jb-core/react";
import "./module-declaration.js";

export const JBPopover = (props: Props) => {
  const element = useRef<JBPopoverWebComponent>(null);
  const lastAnchor = useRef<HTMLElement | null>(null);
  const {
    isOpen,
    anchor,
    children,
    onClose,
    onCancel,
    onClosed,
    onUrlOpen,
    onInit,
    onLoad,
    ref,
    swipeToClose = true,
    dragFromContent = false,
    autoPlacement = true,
    modal = "auto",
    closeOnEscape = true,
    restoreFocus = false,
    autoCloseOnBackgroundClick = true,
    overflowDom,
    overflowHandler = "NONE",
    positionArea,
    ...otherProps
  } = props;
  const inline = positionArea?.inline ?? "start";
  const block = positionArea?.block ?? "after";
  useImperativeHandle(ref, () => element.current!, []);
  useEvents(element, { onClose, onCancel, onClosed, onUrlOpen, onInit, onLoad });

  useEffect(() => {
    if (!element.current) return;
    Object.assign(element.current, { swipeToClose, dragFromContent, autoPlacement, modal, closeOnEscape, restoreFocus, autoCloseOnBackgroundClick, overflowHandler });
    element.current.overflowDom = overflowDom ?? null;
    element.current.positionArea = { inline, block };
  }, [swipeToClose, dragFromContent, autoPlacement, modal, closeOnEscape, restoreFocus, autoCloseOnBackgroundClick, overflowHandler, overflowDom, inline, block]);

  // A stable ref object can point to a different DOM element after a render.
  useEffect(() => {
    const target = anchor?.current ?? null;
    if (lastAnchor.current === target) return;
    lastAnchor.current = target;
    if (target) element.current?.bindTarget(target);
    else element.current?.unBindTarget();
  });
  useEffect(() => {
    const component = element.current;
    return () => {
      component?.unBindTarget();
      lastAnchor.current = null;
    };
  }, []);
  useEffect(() => {
    if (isOpen) element.current?.open();
    else element.current?.close();
  }, [isOpen]);

  return (
    <jb-popover ref={element} {...otherProps}>
      {children}
    </jb-popover>
  );
};

type PopoverProps = EventProps &
  React.PropsWithChildren<{
    isOpen?: boolean;
    swipeToClose?: boolean;
    dragFromContent?: boolean;
    autoPlacement?: boolean;
    modal?: boolean | "auto";
    closeOnEscape?: boolean;
    restoreFocus?: boolean;
    autoCloseOnBackgroundClick?: boolean;
    anchor?: React.RefObject<HTMLElement | null>;
    positionArea?: Partial<PositionArea>;
    overflowHandler?: "NONE" | "SLIDE";
    overflowDom?: HTMLElement | null;
    ref?: React.ForwardedRef<JBPopoverWebComponent | null | undefined>;
  }>;
export type Props = PopoverProps & JBElementStandardProps<JBPopoverWebComponent, keyof PopoverProps>;
JBPopover.displayName = "JBPopover";

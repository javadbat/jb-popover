import type { JBButtonWebComponent } from 'jb-button';
import type { JBPopoverWebComponent } from 'jb-popover';
import { expect, waitFor } from 'storybook/test';

export function getAnchorButton(canvasElement: HTMLElement) {
  const button = canvasElement.querySelector<JBButtonWebComponent>('jb-button');
  expect(button).toBeTruthy();
  return button!;
}

export function getNativeButton(button: JBButtonWebComponent) {
  const nativeButton = button.shadowRoot?.querySelector<HTMLButtonElement>('button');
  expect(nativeButton).toBeTruthy();
  return nativeButton!;
}

export function getPopover(canvasElement: HTMLElement) {
  const popover = canvasElement.querySelector<JBPopoverWebComponent>('jb-popover');
  expect(popover).toBeTruthy();
  expect(popover!.shadowRoot).toBeTruthy();
  return popover!;
}

export function getPopoverWrapper(popover: JBPopoverWebComponent) {
  const wrapper = popover.shadowRoot?.querySelector<HTMLElement>('.jb-popover-web-component');
  expect(wrapper).toBeTruthy();
  return wrapper!;
}

export function getPopoverContent(popover: JBPopoverWebComponent) {
  const content = popover.shadowRoot?.querySelector<HTMLElement>('.popover-content-wrapper');
  expect(content).toBeTruthy();
  return content!;
}

export async function waitForPopoverOpen(popover: JBPopoverWebComponent) {
  const wrapper = getPopoverWrapper(popover);

  await waitFor(() => {
    expect(popover.isOpen).toBe(true);
    expect(wrapper.classList.contains('--opened')).toBe(true);
  });
}

export function expectCloseTo(actual: number, expected: number) {
  expect(Math.round(actual)).toBe(Math.round(expected));
}

export function expectAfterPosition(anchor: HTMLElement, wrapper: HTMLElement) {
  const anchorRect = anchor.getBoundingClientRect();

  expect(wrapper.style.position).toBe('fixed');
  expectCloseTo(parseFloat(wrapper.style.insetBlockStart), anchorRect.bottom);
  expect(wrapper.style.insetBlockEnd).toBe('unset');
}

export function expectBeforePosition(anchor: HTMLElement, wrapper: HTMLElement) {
  const anchorRect = anchor.getBoundingClientRect();

  expect(wrapper.style.position).toBe('fixed');
  expect(wrapper.style.insetBlockStart).toBe('unset');
  expectCloseTo(parseFloat(wrapper.style.insetBlockEnd), window.innerHeight - anchorRect.top);
}

export function expectInlineStartPosition(anchor: HTMLElement, wrapper: HTMLElement) {
  const anchorRect = anchor.getBoundingClientRect();

  expectCloseTo(parseFloat(wrapper.style.insetInlineStart), anchorRect.left);
  expect(wrapper.style.insetInlineEnd).toBe('unset');
}

export function expectInlineEndPosition(anchor: HTMLElement, wrapper: HTMLElement) {
  const anchorRect = anchor.getBoundingClientRect();

  expect(wrapper.style.insetInlineStart).toBe('unset');
  expectCloseTo(parseFloat(wrapper.style.insetInlineEnd), window.innerWidth - anchorRect.right);
}

export function expectInlineCenterPosition(anchor: HTMLElement, wrapper: HTMLElement, content: HTMLElement) {
  const anchorRect = anchor.getBoundingClientRect();
  const contentRect = content.getBoundingClientRect();
  const expected = anchorRect.left + anchorRect.width / 2 - contentRect.width / 2;

  expectCloseTo(parseFloat(wrapper.style.insetInlineStart), expected);
  expect(wrapper.style.insetInlineEnd).toBe('unset');
}

export function expectInlineCenterRtlPosition(anchor: HTMLElement, wrapper: HTMLElement, content: HTMLElement) {
  const anchorRect = anchor.getBoundingClientRect();
  const contentRect = content.getBoundingClientRect();
  const expected = (window.innerWidth - anchorRect.left) - anchorRect.width / 2 - contentRect.width / 2;

  expectCloseTo(parseFloat(wrapper.style.insetInlineStart), expected);
  expect(wrapper.style.insetInlineEnd).toBe('unset');
}

export function expectInlineCenterAfterPosition(anchor: HTMLElement, wrapper: HTMLElement) {
  const anchorRect = anchor.getBoundingClientRect();
  const expected = anchorRect.left + anchorRect.width / 2;

  expectCloseTo(parseFloat(wrapper.style.insetInlineStart), expected);
  expect(wrapper.style.insetInlineEnd).toBe('unset');
}

export function expectInlineCenterBeforePosition(anchor: HTMLElement, wrapper: HTMLElement) {
  const anchorRect = anchor.getBoundingClientRect();
  const expected = window.innerWidth - anchorRect.left - anchorRect.width / 2;

  expect(wrapper.style.insetInlineStart).toBe('unset');
  expectCloseTo(parseFloat(wrapper.style.insetInlineEnd), expected);
}

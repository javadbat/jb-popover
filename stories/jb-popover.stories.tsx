// biome-ignore lint/correctness/noUnusedImports: <explanation>
import React from 'react';
import type { StoryObj } from "@storybook/react-vite";
import type { Meta } from "@storybook/react-vite";
import type { JBButtonWebComponent } from "jb-button";
import { JBButton } from "jb-button/react";
import type { JBPopoverWebComponent } from "jb-popover";
import { JBPopover } from "jb-popover/react";
import { useRef } from "react";
import { useArgs } from 'storybook/preview-api';
import { expect, fn, waitFor } from 'storybook/test';
import {
  expectAfterPosition,
  expectBeforePosition,
  expectInlineCenterAfterPosition,
  expectInlineCenterBeforePosition,
  expectInlineCenterPosition,
  expectInlineCenterRtlPosition,
  expectInlineEndPosition,
  expectInlineStartPosition,
  getAnchorButton,
  getPopover,
  getPopoverContent,
  getPopoverWrapper,
  waitForPopoverOpen,
} from './test-utils';

const meta = {
  title: "Components/JBPopover",
  component: JBPopover,
  decorators: [(Story) => {
    const anchorRef = useRef<JBButtonWebComponent>(null);
    const popoverRef = useRef<JBPopoverWebComponent>(null);
    const [args, updateArgs] = useArgs();
    return (
      <div style={{ paddingInlineStart: `10dvw`, paddingBlockStart: `10dvh` }}>
        <JBButton ref={anchorRef} onClick={() => { updateArgs({ isOpen: !args.isOpen }) }}>Click me</JBButton>
        <Story args={{ ...args, anchor: anchorRef, ref: popoverRef, onClose: () => { args.onClose?.(); updateArgs({ isOpen: false }) } }} />
      </div>
    )
  }
  ],
} satisfies Meta<typeof JBPopover>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Normal: Story = {
  args: {
    children: <div>Hello World</div>,
    isOpen: false
  },
  play: async ({ canvasElement }) => {
    const anchorButton = getAnchorButton(canvasElement);
    const popover = getPopover(canvasElement);
    const wrapper = getPopoverWrapper(popover);

    popover.bindTarget(anchorButton);
    popover.open();
    await waitForPopoverOpen(popover);

    expectAfterPosition(anchorButton, wrapper);
    expectInlineStartPosition(anchorButton, wrapper);
  }
};

export const OpenClose: Story = {
  args: {
    children: <div>Open and close the popover programmatically.</div>,
    isOpen: false,
  },
  play: async ({ canvasElement }) => {
    const popover = getPopover(canvasElement);
    popover.bindTarget(getAnchorButton(canvasElement));

    popover.open();
    await waitForPopoverOpen(popover);

    popover.close();
    await waitFor(() => expect(popover.isOpen).toBe(false));
    popover.unBindTarget();
  },
};

export const OverflowSlide: Story = {
  args: {
    children: <div>Popover content remains visible when it would overflow.</div>,
    isOpen: false,
    overflowHandler: 'SLIDE',
  },
  play: async ({ canvasElement }) => {
    const popover = getPopover(canvasElement);
    popover.bindTarget(getAnchorButton(canvasElement));
    popover.open();

    await waitForPopoverOpen(popover);
    expect(popover.overflowHandler).toBe('SLIDE');
  },
};

export const MobileHashState: Story = {
  args: {
    id: 'mobile-hash-popover',
    children: <div>This popover can be addressed with a URL hash on mobile.</div>,
    isOpen: false,
  },
  play: async ({ canvasElement }) => {
    const popover = getPopover(canvasElement);
    expect(popover.PopoverHashPath).toBe('#mobile-hash-popover');
    let urlOpenDispatched = false;
    popover.addEventListener('urlOpen', () => { urlOpenDispatched = true; }, { once: true });
    const currentUrl = window.location.href;
    window.history.replaceState(window.history.state, '', '#mobile-hash-popover');
    popover.checkInitialOpenness();
    expect(popover.isOpen).toBe(true);
    expect(urlOpenDispatched).toBe(true);
    popover.close();
    window.history.replaceState(window.history.state, '', currentUrl);
  },
};

export const Events: Story = {
  args: {
    children: <div>Popover lifecycle events.</div>,
    isOpen: false,
    onLoad: fn(),
    onInit: fn(),
    onClose: fn(),
  },
  play: async ({ canvasElement, args }) => {
    const popover = getPopover(canvasElement);
    popover.dispatchEvent(new CustomEvent('load', { bubbles: true, composed: true }));
    popover.dispatchEvent(new CustomEvent('init', { bubbles: true, composed: true }));
    popover.dispatchEvent(new CustomEvent('close', {
      bubbles: true,
      composed: true,
      detail: { eventType: 'OUTSIDE_CLICK' },
    }));

    await waitFor(() => {
      expect(args.onLoad).toHaveBeenCalled();
      expect(args.onInit).toHaveBeenCalled();
      expect(args.onClose).toHaveBeenCalled();
    });
  },
};
export const InlineEndPositionArea: Story = {
  args: {
    children: <div>Align on End of Box</div>,
    isOpen: false,
    positionArea: { inline: "end" },
  },
  play: async ({ canvasElement }) => {
    const anchorButton = getAnchorButton(canvasElement);
    const popover = getPopover(canvasElement);
    const wrapper = getPopoverWrapper(popover);

    popover.bindTarget(anchorButton);
    popover.positionArea = { inline: 'end' };
    popover.open();
    await waitForPopoverOpen(popover);

    expectAfterPosition(anchorButton, wrapper);
    expectInlineEndPosition(anchorButton, wrapper);
  }
};
export const InlineCenterPositionArea: Story = {
  args: {
    children: <div>
      <div>Popover Will Align on Center of Box</div>
      <div>center of the popover is in the center of the trigger button</div>

    </div>,
    isOpen: false,
    positionArea: { inline: "center" },
  },
  play: async ({ canvasElement }) => {
    const anchorButton = getAnchorButton(canvasElement);
    const popover = getPopover(canvasElement);
    const wrapper = getPopoverWrapper(popover);
    const content = getPopoverContent(popover);

    anchorButton.style.width = '18rem';

    popover.bindTarget(anchorButton);
    popover.positionArea = { inline: 'center' };
    popover.open();
    await waitForPopoverOpen(popover);

    expectAfterPosition(anchorButton, wrapper);
    expectInlineCenterPosition(anchorButton, wrapper, content);

    anchorButton.style.direction = 'rtl';
    popover.positionArea = { inline: 'center' };

    await waitFor(() => {
      expectInlineCenterRtlPosition(anchorButton, wrapper, content);
    });
  }
};
export const InlineCenterAfterPositionArea: Story = {
  args: {
    children: <div>Align on Center of Box</div>,
    isOpen: false,
    positionArea: { inline: "center-after" },
  },
  play: async ({ canvasElement }) => {
    const anchorButton = getAnchorButton(canvasElement);
    const popover = getPopover(canvasElement);
    const wrapper = getPopoverWrapper(popover);

    popover.bindTarget(anchorButton);
    popover.positionArea = { inline: 'center-after' };
    popover.open();
    await waitForPopoverOpen(popover);

    expectAfterPosition(anchorButton, wrapper);
    expectInlineCenterAfterPosition(anchorButton, wrapper);
  }
};
export const InlineCenterBeforePositionArea: Story = {
  args: {
    children: <div>
      <div>Popover Will Align Before Center of Box</div>
      <div>Test is Easy just change Page direction to see in every possible situation</div>
    </div>,
    isOpen: false,
    positionArea: { inline: "center-before" },
  },
  play: async ({ canvasElement }) => {
    const anchorButton = getAnchorButton(canvasElement);
    const popover = getPopover(canvasElement);
    const wrapper = getPopoverWrapper(popover);

    popover.bindTarget(anchorButton);
    popover.positionArea = { inline: 'center-before' };
    popover.open();
    await waitForPopoverOpen(popover);

    expectAfterPosition(anchorButton, wrapper);
    expectInlineCenterBeforePosition(anchorButton, wrapper);
  }
};
export const BlockBeforePositionArea: Story = {
  args: {
    children: <div>Align on End of Box</div>,
    isOpen: false,
    positionArea: { block: "before" },
  },
  play: async ({ canvasElement }) => {
    const anchorButton = getAnchorButton(canvasElement);
    const popover = getPopover(canvasElement);
    const wrapper = getPopoverWrapper(popover);

    popover.bindTarget(anchorButton);
    popover.positionArea = { block: 'before' };
    popover.open();
    await waitForPopoverOpen(popover);

    expectBeforePosition(anchorButton, wrapper);
    expectInlineStartPosition(anchorButton, wrapper);
  }
};

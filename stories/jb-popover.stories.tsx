// biome-ignore lint/correctness/noUnusedImports: <explanation>
import React from 'react';
import type { StoryObj } from "@storybook/react-vite";
import type { Meta } from "@storybook/react-vite";
import type { JBButtonWebComponent } from "jb-button";
import { JBButton } from "jb-button/react";
import { JBModal } from "jb-modal/react";
import type { JBPopoverWebComponent } from "jb-popover";
import { JBPopover } from "jb-popover/react";
import { useRef, useState } from "react";
import { useArgs } from 'storybook/preview-api';
import { expect, fn, userEvent, waitFor } from 'storybook/test';
import {
  expectAfterPosition,
  expectBeforePosition,
  expectCloseTo,
  expectInlineCenterAfterPosition,
  expectInlineCenterBeforePosition,
  expectInlineCenterPosition,
  expectInlineCenterRtlPosition,
  expectInlineEndPosition,
  expectInlineStartPosition,
  getAnchorButton,
  getNativeButton,
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

export const TransformedContainer: Story = {
  args: {
    children: <div>Positioned inside a transformed modal container.</div>,
    isOpen: false,
  },
  play: async ({ canvasElement }) => {
    const anchorButton = getAnchorButton(canvasElement);
    const popover = getPopover(canvasElement);
    const wrapper = getPopoverWrapper(popover);
    const modalHost = popover.parentElement!;

    // Match a modal's shadow-DOM slot and transformed animation wrapper.
    const modalRoot = modalHost.attachShadow({ mode: 'open' });
    const modalWrapper = document.createElement('div');
    const modalSlot = document.createElement('slot');
    modalWrapper.style.transform = 'translate(6rem, 4rem)';
    modalWrapper.append(modalSlot);
    modalRoot.append(modalWrapper);
    popover.bindTarget(anchorButton);
    popover.open();
    await waitForPopoverOpen(popover);

    await waitFor(() => {
      const anchorRect = anchorButton.getBoundingClientRect();
      const wrapperRect = wrapper.getBoundingClientRect();
      expectCloseTo(wrapperRect.left, anchorRect.left);
      expectCloseTo(wrapperRect.top, anchorRect.bottom);
    });
  },
};

const modalOverflowRows = Array.from({ length: 36 }, (_, index) => `Overflow content row ${index + 1}`);

export const InsideScrollableModal: Story = {
  render: () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);
    const anchorRef = useRef<JBButtonWebComponent>(null);

    return (
      <div>
        <JBButton data-testid="open-modal" onClick={() => setIsModalOpen(true)}>
          Open modal
        </JBButton>
        <JBModal
          isOpen={isModalOpen}
          label="Scrollable modal with popover"
          onClose={() => {
            setIsPopoverOpen(false);
            setIsModalOpen(false);
          }}
        >
          <div slot="header">Popover inside an overflowing modal</div>
          <div
            slot="content"
            data-testid="modal-overflow-content"
            style={{ display: 'grid', gap: '0.75rem' }}
          >
            {modalOverflowRows.slice(0, 12).map((row) => <div key={row}>{row}</div>)}
            <JBButton
              ref={anchorRef}
              data-testid="open-modal-popover"
              onClick={() => setIsPopoverOpen((value) => !value)}
            >
              Open fixed popover
            </JBButton>
            <JBPopover
              data-testid="modal-popover"
              anchor={anchorRef}
              isOpen={isPopoverOpen}
              onClose={() => setIsPopoverOpen(false)}
            >
              <div>Popover anchored inside the modal</div>
            </JBPopover>
            {modalOverflowRows.slice(12).map((row) => <div key={row}>{row}</div>)}
          </div>
          <div slot="footer">
            <JBButton color="light" onClick={() => setIsModalOpen(false)}>Close modal</JBButton>
          </div>
        </JBModal>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const modalOpener = canvasElement.querySelector<JBButtonWebComponent>('[data-testid="open-modal"]')!;
    await userEvent.click(getNativeButton(modalOpener));

    const modal = canvasElement.querySelector('jb-modal')!;
    const overflowContent = canvasElement.querySelector<HTMLElement>('[data-testid="modal-overflow-content"]')!;
    const popoverOpener = canvasElement.querySelector<JBButtonWebComponent>('[data-testid="open-modal-popover"]')!;
    const popover = canvasElement.querySelector<JBPopoverWebComponent>('[data-testid="modal-popover"]')!;
    const wrapper = getPopoverWrapper(popover);

    await waitFor(() => {
      expect(modal.isOpen).toBe(true);
      expect(overflowContent.scrollHeight).toBeGreaterThan(overflowContent.clientHeight);
    });

    popoverOpener.scrollIntoView({ block: 'center' });
    await userEvent.click(getNativeButton(popoverOpener));

    await waitFor(() => {
      const anchorRect = popoverOpener.getBoundingClientRect();
      const wrapperRect = wrapper.getBoundingClientRect();
      expect(popover.isOpen).toBe(true);
      expect(wrapper.style.position).toBe('fixed');
      expectCloseTo(wrapperRect.left, anchorRect.left);
      expectCloseTo(wrapperRect.top, anchorRect.bottom);
    });

    overflowContent.scrollTop += 24;
    await waitFor(() => {
      const anchorRect = popoverOpener.getBoundingClientRect();
      const wrapperRect = wrapper.getBoundingClientRect();
      expectCloseTo(wrapperRect.left, anchorRect.left);
      expectCloseTo(wrapperRect.top, anchorRect.bottom);
    });
  },
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

// biome-ignore lint/correctness/noUnusedImports: Storybook uses the classic JSX transform.
import React from "react";
import type { StoryObj } from "@storybook/react-vite";
import type { Meta } from "@storybook/react-vite";
import type { JBButtonWebComponent } from "jb-button";
import { JBButton } from "jb-button/react";
import { JBModal } from "jb-modal/react";
import type { JBPopoverWebComponent } from "jb-popover";
import { JBPopover } from "jb-popover/react";
import { useRef, useState } from "react";
import { useArgs } from "storybook/preview-api";
import { expect, fn, userEvent, waitFor } from "storybook/test";
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
} from "./test-utils";
import { JBSelect } from "jb-select/react";
import { JBOption } from "jb-select/option/react";

const meta = {
  title: "Components/JBPopover",
  component: JBPopover,
  args: { autoPlacement: false },
  decorators: [
    (Story, context) => {
      const anchorRef = useRef<JBButtonWebComponent>(null);
      const popoverRef = useRef<JBPopoverWebComponent>(null);
      const [args, updateArgs] = useArgs();
      if (context.parameters.standalone) return <Story />;
      return (
        <div style={{ paddingInlineStart: `10dvw`, paddingBlockStart: `10dvh` }}>
          <JBButton
            ref={anchorRef}
            onClick={() => {
              updateArgs({ isOpen: !args.isOpen });
            }}
          >
            Click me
          </JBButton>
          <Story
            args={{
              ...args,
              anchor: anchorRef,
              ref: popoverRef,
              onClose: event => {
                args.onClose?.(event);
                if (!event.defaultPrevented) updateArgs({ isOpen: false });
              },
            }}
          />
        </div>
      );
    },
  ],
} satisfies Meta<typeof JBPopover>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Normal: Story = {
  args: {
    children: <div>Hello World</div>,
    isOpen: false,
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
  },
};

export const NestedPopovers: Story = {
  parameters: { standalone: true, layout: "fullscreen" },
  render: () => {
    const [outerOpen, setOuterOpen] = useState(false);
    const [innerOpen, setInnerOpen] = useState(false);
    const outerAnchor = useRef<JBButtonWebComponent>(null);
    const innerAnchor = useRef<JBButtonWebComponent>(null);

    return (
      <>
        <div style={{ minHeight: "28rem", display: "grid", placeItems: "center", background: "linear-gradient(135deg, #f5f7ff, #eefaf7)", padding: "2rem" }}>
          <JBButton ref={outerAnchor} data-testid="nested-open-outer" onClick={() => setOuterOpen(true)}>
            Open command center
          </JBButton>
        </div>
        <JBPopover
          data-testid="nested-outer"
          aria-label="Command center"
          isOpen={outerOpen}
          modal
          restoreFocus
          anchor={outerAnchor}
          onClose={() => {
            setInnerOpen(false);
            setOuterOpen(false);
          }}
        >
          <section style={{ width: "min(24rem, calc(100vw - 2rem))", boxSizing: "border-box", padding: "1.25rem", display: "grid", gap: "1rem", color: "#18324a" }}>
            <header style={{ display: "grid", gap: "0.25rem" }}>
              <strong style={{ fontSize: "1.15rem" }}>Command center</strong>
              <span style={{ color: "#557086", fontSize: "0.9rem" }}>Manage an action without losing your place.</span>
            </header>
            <div style={{ display: "grid", gap: "0.65rem", padding: "1rem", borderRadius: "0.9rem", background: "#f3f7fb" }}>
              <span style={{ fontSize: "0.85rem", color: "#557086" }}>Workspace</span>
              <strong>Design system / Production</strong>
              <JBButton ref={innerAnchor} data-testid="nested-open-inner" onClick={() => setInnerOpen(value => !value)}>
                Configure workspace
              </JBButton>
            </div>
            <JBPopover
              data-testid="nested-inner"
              aria-label="Workspace settings"
              anchor={innerAnchor}
              isOpen={innerOpen}
              modal
              restoreFocus
              onClose={event => {
                event.stopPropagation();
                setInnerOpen(false);
              }}
            >
              <div style={{ width: "min(19rem, calc(100vw - 2rem))", padding: "1rem", display: "grid", gap: "0.8rem" }}>
                <strong>Workspace settings</strong>
                  <JBSelect label="environment" defaultValue="production">
                    <JBOption value="production">Production</JBOption>
                    <JBOption value="staging">Staging</JBOption>
                  </JBSelect>
                <JBButton data-testid="nested-save" onClick={() => setInnerOpen(false)}>
                  Save settings
                </JBButton>
              </div>
            </JBPopover>
            <button type="button" onClick={() => setOuterOpen(false)} style={{ justifySelf: "start", border: 0, background: "transparent", color: "#557086", cursor: "pointer" }}>
              Close command center
            </button>
          </section>
        </JBPopover>
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const openOuter = canvasElement.querySelector<JBButtonWebComponent>('[data-testid="nested-open-outer"]')!;
    const initialPosition = openOuter.getBoundingClientRect();
    await userEvent.click(getNativeButton(openOuter));

    const outer = canvasElement.querySelector<JBPopoverWebComponent>('[data-testid="nested-outer"]')!;
    const openInner = canvasElement.querySelector<JBButtonWebComponent>('[data-testid="nested-open-inner"]')!;
    const inner = canvasElement.querySelector<JBPopoverWebComponent>('[data-testid="nested-inner"]')!;
    await waitFor(() => expect(outer.isOpen).toBe(true));
    expectCloseTo(openOuter.getBoundingClientRect().top, initialPosition.top);
    expectCloseTo(openOuter.getBoundingClientRect().left, initialPosition.left);

    await userEvent.click(getNativeButton(openInner));
    await waitFor(() => expect(inner.isOpen).toBe(true));
    expect(inner.shadowRoot!.activeElement).toBe(getPopoverContent(inner));
    expect(inner.querySelector("jb-select")!.isOpen).toBe(false);
    await waitFor(() => {
      const rect = getPopoverContent(inner).getBoundingClientRect();
      expect(rect.top).toBeGreaterThanOrEqual(0);
      expect(rect.bottom).toBeLessThanOrEqual(window.innerHeight + 1);
      expect(rect.left).toBeGreaterThanOrEqual(0);
      expect(rect.right).toBeLessThanOrEqual(window.innerWidth + 1);
    });

    await userEvent.keyboard("{Escape}");
    await waitFor(() => {
      expect(inner.isOpen).toBe(false);
      expect(outer.isOpen).toBe(true);
    });

    const saveHost = canvasElement.querySelector<JBButtonWebComponent>('[data-testid="nested-save"]')!;
    const saveButton = getNativeButton(saveHost);
    saveButton.setAttribute("autofocus", "");
    try {
      await userEvent.click(getNativeButton(openInner));
      await waitFor(() => expect(inner.isOpen).toBe(true));
      expect(saveHost.shadowRoot!.activeElement).toBe(saveButton);
      expect(inner.querySelector("jb-select")!.isOpen).toBe(false);
      await userEvent.click(saveButton);
    } finally {
      saveButton.removeAttribute("autofocus");
    }
    await waitFor(() => expect(inner.isOpen).toBe(false));
    expect(outer.isOpen).toBe(true);
  },
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
    const modalRoot = modalHost.attachShadow({ mode: "open" });
    const modalWrapper = document.createElement("div");
    const modalSlot = document.createElement("slot");
    modalWrapper.style.transform = "translate(6rem, 4rem)";
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
          <div slot="content" data-testid="modal-overflow-content" style={{ display: "grid", gap: "0.75rem" }}>
            {modalOverflowRows.slice(0, 12).map(row => (
              <div key={row}>{row}</div>
            ))}
            <JBButton ref={anchorRef} data-testid="open-modal-popover" onClick={() => setIsPopoverOpen(value => !value)}>
              Open fixed popover
            </JBButton>
            <JBPopover data-testid="modal-popover" anchor={anchorRef} isOpen={isPopoverOpen} onClose={() => setIsPopoverOpen(false)}>
              <div>Popover anchored inside the modal</div>
            </JBPopover>
            {modalOverflowRows.slice(12).map(row => (
              <div key={row}>{row}</div>
            ))}
          </div>
          <div slot="footer">
            <JBButton color="light" onClick={() => setIsModalOpen(false)}>
              Close modal
            </JBButton>
          </div>
        </JBModal>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const modalOpener = canvasElement.querySelector<JBButtonWebComponent>('[data-testid="open-modal"]')!;
    await userEvent.click(getNativeButton(modalOpener));

    const modal = canvasElement.querySelector("jb-modal")!;
    const overflowContent = canvasElement.querySelector<HTMLElement>('[data-testid="modal-overflow-content"]')!;
    const popoverOpener = canvasElement.querySelector<JBButtonWebComponent>('[data-testid="open-modal-popover"]')!;
    const popover = canvasElement.querySelector<JBPopoverWebComponent>('[data-testid="modal-popover"]')!;
    const wrapper = getPopoverWrapper(popover);

    await waitFor(() => {
      expect(modal.isOpen).toBe(true);
      expect(overflowContent.scrollHeight).toBeGreaterThan(overflowContent.clientHeight);
    });

    popoverOpener.scrollIntoView({ block: "center" });
    await userEvent.click(getNativeButton(popoverOpener));

    await waitFor(() => {
      const anchorRect = popoverOpener.getBoundingClientRect();
      const wrapperRect = wrapper.getBoundingClientRect();
      expect(popover.isOpen).toBe(true);
      expect(wrapper.style.position).toBe("fixed");
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
    overflowHandler: "SLIDE",
  },
  play: async ({ canvasElement }) => {
    const popover = getPopover(canvasElement);
    popover.bindTarget(getAnchorButton(canvasElement));
    popover.open();

    await waitForPopoverOpen(popover);
    expect(popover.overflowHandler).toBe("SLIDE");
  },
};

export const MobileHashState: Story = {
  args: {
    id: "mobile-hash-popover",
    children: <div>This popover can be addressed with a URL hash on mobile.</div>,
    isOpen: false,
  },
  play: async ({ canvasElement }) => {
    const popover = getPopover(canvasElement);
    expect(popover.PopoverHashPath).toBe("#mobile-hash-popover");
    let urlEventDispatched = false;
    popover.addEventListener(
      "url-open",
      () => {
        urlEventDispatched = true;
      },
      { once: true },
    );
    const currentUrl = window.location.href;
    window.history.replaceState(window.history.state, "", "#mobile-hash-popover");
    popover.checkInitialOpenness();
    expect(popover.isOpen).toBe(true);
    expect(urlEventDispatched).toBe(true);
    popover.close();
    window.history.replaceState(window.history.state, "", currentUrl);
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
    popover.dispatchEvent(new CustomEvent("load", { bubbles: true, composed: true }));
    popover.dispatchEvent(new CustomEvent("init", { bubbles: true, composed: true }));
    popover.dispatchEvent(
      new CustomEvent("close", {
        bubbles: true,
        composed: true,
        detail: { eventType: "OUTSIDE_CLICK" },
      }),
    );

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
    popover.positionArea = { inline: "end" };
    popover.open();
    await waitForPopoverOpen(popover);

    expectAfterPosition(anchorButton, wrapper);
    expectInlineEndPosition(anchorButton, wrapper);
  },
};
export const InlineCenterPositionArea: Story = {
  args: {
    children: (
      <div>
        <div>Popover Will Align on Center of Box</div>
        <div>center of the popover is in the center of the trigger button</div>
      </div>
    ),
    isOpen: false,
    positionArea: { inline: "center" },
  },
  play: async ({ canvasElement }) => {
    const anchorButton = getAnchorButton(canvasElement);
    const popover = getPopover(canvasElement);
    const wrapper = getPopoverWrapper(popover);
    const content = getPopoverContent(popover);

    anchorButton.style.width = "18rem";

    popover.bindTarget(anchorButton);
    popover.positionArea = { inline: "center" };
    popover.open();
    await waitForPopoverOpen(popover);

    expectAfterPosition(anchorButton, wrapper);
    expectInlineCenterPosition(anchorButton, wrapper, content);

    anchorButton.style.direction = "rtl";
    popover.positionArea = { inline: "center" };

    await waitFor(() => {
      expectInlineCenterRtlPosition(anchorButton, wrapper, content);
    });
  },
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
    popover.positionArea = { inline: "center-after" };
    popover.open();
    await waitForPopoverOpen(popover);

    expectAfterPosition(anchorButton, wrapper);
    expectInlineCenterAfterPosition(anchorButton, wrapper);
  },
};
export const InlineCenterBeforePositionArea: Story = {
  args: {
    children: (
      <div>
        <div>Popover Will Align Before Center of Box</div>
        <div>Test is Easy just change Page direction to see in every possible situation</div>
      </div>
    ),
    isOpen: false,
    positionArea: { inline: "center-before" },
  },
  play: async ({ canvasElement }) => {
    const anchorButton = getAnchorButton(canvasElement);
    const popover = getPopover(canvasElement);
    const wrapper = getPopoverWrapper(popover);

    popover.bindTarget(anchorButton);
    popover.positionArea = { inline: "center-before" };
    popover.open();
    await waitForPopoverOpen(popover);

    expectAfterPosition(anchorButton, wrapper);
    expectInlineCenterBeforePosition(anchorButton, wrapper);
  },
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
    popover.positionArea = { block: "before" };
    popover.open();
    await waitForPopoverOpen(popover);

    expectBeforePosition(anchorButton, wrapper);
    expectInlineStartPosition(anchorButton, wrapper);
  },
};

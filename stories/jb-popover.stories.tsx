// biome-ignore lint/correctness/noUnusedImports: <explanation>
import React from 'react';
import type { StoryObj } from "@storybook/react";
import type { Meta } from "@storybook/react";
import type { JBButtonWebComponent } from "jb-button";
import { JBButton } from "jb-button/react";
import type { JBPopoverWebComponent } from "jb-popover";
import { JBPopover, type Props } from "jb-popover/react";
import { useRef } from "react";
import { useArgs } from 'storybook/internal/preview-api';

const meta: Meta<Props> = {
  title: "Components/JBPopover",
  component: JBPopover,
  decorators: [(Story) =>{
    const anchorRef = useRef<JBButtonWebComponent>(null);
    const popoverRef = useRef<JBPopoverWebComponent>(null);
      const [args, updateArgs] = useArgs();
    return(
      <div style={{paddingInlineStart:`50dvw`,paddingBlockStart:`50dvh`}}>
        <JBButton ref={anchorRef} onClick={()=>{updateArgs({isOpen:!args.isOpen})}}>Click me</JBButton>
        <Story args={{...args,anchor:anchorRef, ref:popoverRef, onClose:()=>{updateArgs({isOpen:false})}}}/>
      </div>
    )
  }
],
};
export default meta;
type Story = StoryObj<typeof JBPopover>;

export const Normal: Story = {
  args: {
    children: <div>Hello World</div>,
    isOpen:false
  }
};
export const InlineEndPositionArea: Story = {
  args: {
    children: <div>Align on End of Box</div>,
    isOpen:false,
    positionArea:{inline:"end"},
  }
};
export const InlineCenterPositionArea: Story = {
  args: {
    children: <div>Align on Center of Box</div>,
    isOpen:false,
    positionArea:{inline:"center"},
  }
};
export const InlineCenterAfterPositionArea: Story = {
  args: {
    children: <div>Align on Center of Box</div>,
    isOpen:false,
    positionArea:{inline:"center-after"},
  }
};
export const InlineCenterBeforePositionArea: Story = {
  args: {
    children: <div>Align on Center of Box</div>,
    isOpen:false,
    positionArea:{inline:"center-before"},
  }
};
export const BlockBeforePositionArea: Story = {
  args: {
    children: <div>Align on End of Box</div>,
    isOpen:false,
    positionArea:{block:"before"},
  }
};
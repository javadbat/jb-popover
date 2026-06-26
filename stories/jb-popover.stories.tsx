// biome-ignore lint/correctness/noUnusedImports: <explanation>
import React from 'react';
import type { StoryObj } from "@storybook/react";
import type { Meta } from "@storybook/react";
import type { JBButtonWebComponent } from "jb-button";
import { JBButton } from "jb-button/react";
import type { JBPopoverWebComponent } from "jb-popover";
import { JBPopover, type Props } from "jb-popover/react";
import { useRef } from "react";
import { useArgs } from 'storybook/preview-api';

const meta: Meta<Props> = {
  title: "Components/JBPopover",
  component: JBPopover,
  decorators: [(Story) =>{
    const anchorRef = useRef<JBButtonWebComponent>(null);
    const popoverRef = useRef<JBPopoverWebComponent>(null);
      const [args, updateArgs] = useArgs();
    return(
      <div style={{paddingInlineStart:`10dvw`,paddingBlockStart:`10dvh`}}>
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
    children: <div>
      <div>Popover Will Align on Center of Box</div>
      <div>center of the popover is in the center of the trigger button</div>
      
      </div>,
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
    children: <div>
        <div>Popover Will Align Before Center of Box</div>
        <div>Test is Easy just change Page direction to see in every possible situation</div>
      </div>,
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

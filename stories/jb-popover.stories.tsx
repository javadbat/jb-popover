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
      <div style={{paddingInline:`5rem`,paddingBlock:`5rem`,}}>
        <JBButton ref={anchorRef} onClick={()=>{updateArgs({isOpen:true})}}>Click me</JBButton>
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
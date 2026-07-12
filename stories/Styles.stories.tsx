import React, { useRef, useState } from 'react';
import { JBButton } from 'jb-button/react';
import type { JBButtonWebComponent } from 'jb-button';
import { JBPopover } from 'jb-popover/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import '../../../docs/styles/ant-design.css';
import '../../../docs/styles/aurora.css';
import '../../../docs/styles/bootstrap.css';
import '../../../docs/styles/candy.css';
import '../../../docs/styles/carbon.css';
import '../../../docs/styles/cupertino.css';
import '../../../docs/styles/fluent.css';
import '../../../docs/styles/forest.css';
import '../../../docs/styles/material.css';
import '../../../docs/styles/porcelain.css';
import '../../../docs/styles/sunset.css';
import '../../../docs/styles/terminal.css';
import '../../jb-button/stories/styles/style-ant-design.css';
import '../../jb-button/stories/styles/style-aurora.css';
import '../../jb-button/stories/styles/style-bootstrap.css';
import '../../jb-button/stories/styles/style-candy.css';
import '../../jb-button/stories/styles/style-carbon.css';
import '../../jb-button/stories/styles/style-cupertino.css';
import '../../jb-button/stories/styles/style-fluent.css';
import '../../jb-button/stories/styles/style-forest.css';
import '../../jb-button/stories/styles/style-material.css';
import '../../jb-button/stories/styles/style-porcelain.css';
import '../../jb-button/stories/styles/style-sunset.css';
import '../../jb-button/stories/styles/style-terminal.css';
import './styles/style-ant-design.css';
import './styles/style-aurora.css';
import './styles/style-bootstrap.css';
import './styles/style-candy.css';
import './styles/style-carbon.css';
import './styles/style-cupertino.css';
import './styles/style-fluent.css';
import './styles/style-forest.css';
import './styles/style-material.css';
import './styles/style-porcelain.css';
import './styles/style-sunset.css';
import './styles/style-terminal.css';

const meta = {
  title: "Components/JBPopover/Style",
  component: JBPopover,
} satisfies Meta<typeof JBPopover>;

export default meta;
type Story = StoryObj<typeof meta>;

const styleSamples = [
  { name: "Carbon", themeClassName: "carbon-style", popoverClassName: "carbon-style", buttonClassName: "carbon-style carbon-style", cardClassName: "carbon-popover-card" },
  { name: "Aurora", themeClassName: "aurora-style", popoverClassName: "aurora-style", buttonClassName: "aurora-style aurora-style", cardClassName: "aurora-popover-card" },
  { name: "Forest", themeClassName: "forest-style", popoverClassName: "forest-style", buttonClassName: "forest-style forest-style", cardClassName: "forest-popover-card" },
  { name: "Sunset", themeClassName: "sunset-style", popoverClassName: "sunset-style", buttonClassName: "sunset-style sunset-style", cardClassName: "sunset-popover-card" },
  { name: "Porcelain", themeClassName: "porcelain-style", popoverClassName: "porcelain-style", buttonClassName: "porcelain-style porcelain-style", cardClassName: "porcelain-popover-card" },
  { name: "Candy", themeClassName: "candy-style", popoverClassName: "candy-style", buttonClassName: "candy-style candy-style", cardClassName: "candy-popover-card" },
  { name: "Terminal", themeClassName: "terminal-style", popoverClassName: "terminal-style", buttonClassName: "terminal-style terminal-style", cardClassName: "terminal-popover-card" },
  { name: "Material", themeClassName: "material-style", popoverClassName: "material-style", buttonClassName: "material-style material-style", cardClassName: "material-popover-card" },
  { name: "Fluent", themeClassName: "fluent-style", popoverClassName: "fluent-style", buttonClassName: "fluent-style fluent-style", cardClassName: "fluent-popover-card" },
  { name: "Bootstrap", themeClassName: "bootstrap-style", popoverClassName: "bootstrap-style", buttonClassName: "bootstrap-style bootstrap-style", cardClassName: "bootstrap-popover-card" },
  { name: "Cupertino", themeClassName: "cupertino-style", popoverClassName: "cupertino-style", buttonClassName: "cupertino-style cupertino-style", cardClassName: "cupertino-popover-card" },
  { name: "Ant Design", themeClassName: "ant-design-style", popoverClassName: "ant-design-style", buttonClassName: "ant-design-style", cardClassName: "ant-popover-card" },
];

type PopoverStyleSampleProps = {
  buttonClassName: string;
  cardClassName: string;
  popoverClassName: string;
  themeClassName: string;
};

function PopoverPanel({ cardClassName }: { cardClassName: string }) {
  return (
    <div className={cardClassName}>
      <strong>Quick actions</strong>
      <span>Review status, assign an owner, or open the full detail view.</span>
      <div className="popover-action-row">
        <button type="button">Assign</button>
        <button type="button">Details</button>
      </div>
    </div>
  );
}

function PopoverStyleSample({
  buttonClassName,
  cardClassName,
  popoverClassName,
  themeClassName,
}: PopoverStyleSampleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const anchorRef = useRef<JBButtonWebComponent | null>(null);

  return (
    <div
      className={`${themeClassName} popover-demo-shell`}
      style={{
        position: "relative",
        minHeight: "12rem",
        display: "grid",
        alignContent: "start",
        justifyItems: "start",
        gap: "0.75rem",
      }}
    >
      <JBButton ref={anchorRef} className={buttonClassName} onClick={() => setIsOpen((value) => !value)}>
        Open popover
      </JBButton>
      <JBPopover
        anchor={anchorRef}
        className={popoverClassName}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        positionArea={{ inline: "start", block: "after" }}
      >
        <PopoverPanel cardClassName={cardClassName} />
      </JBPopover>
    </div>
  );
}

export const Gallery: Story = {
  name: "Gallery",
  render: () => (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(21rem, 1fr))",
      gap: "1.25rem",
      alignItems: "start",
      width: "min(100%, 82rem)",
    }}>
      {styleSamples.map((sample) => (
        <section
          key={sample.popoverClassName}
          className={sample.themeClassName}
          style={{
            display: "grid",
            gap: "0.75rem",
            minWidth: 0,
            padding: "1rem",
            background: "var(--jb-surface, #ffffff)",
            border: "1px solid var(--jb-border-color, #e5e7eb)",
            borderRadius: "0.75rem",
            boxShadow: "0 0.75rem 1.75rem oklch(0% 0 0 / 0.08)",
          }}
        >
          <div style={{
            width: "100%",
            color: "var(--jb-text-primary, #334155)",
            fontSize: "0.875rem",
            fontWeight: 700,
            lineHeight: 1.4,
            textAlign: "center",
          }}>
            {sample.name}
          </div>
          <PopoverStyleSample {...sample} />
        </section>
      ))}
    </div>
  ),
};

export const Default: Story = {
  name: "Default",
  render: () => <PopoverStyleSample buttonClassName="" cardClassName="" popoverClassName="" themeClassName="" />,
};

export const Carbon: Story = {
  name: "Carbon",
  render: () => <PopoverStyleSample {...styleSamples[0]} />,
};

export const Aurora: Story = {
  name: "Aurora",
  render: () => <PopoverStyleSample {...styleSamples[1]} />,
};

export const Forest: Story = {
  name: "Forest",
  render: () => <PopoverStyleSample {...styleSamples[2]} />,
};

export const Sunset: Story = {
  name: "Sunset",
  render: () => <PopoverStyleSample {...styleSamples[3]} />,
};

export const Porcelain: Story = {
  name: "Porcelain",
  render: () => <PopoverStyleSample {...styleSamples[4]} />,
};

export const Candy: Story = {
  name: "Candy",
  render: () => <PopoverStyleSample {...styleSamples[5]} />,
};

export const Terminal: Story = {
  name: "Terminal",
  render: () => <PopoverStyleSample {...styleSamples[6]} />,
};

export const Material: Story = {
  name: "Material",
  render: () => <PopoverStyleSample {...styleSamples[7]} />,
};

export const Fluent: Story = {
  name: "Fluent",
  render: () => <PopoverStyleSample {...styleSamples[8]} />,
};

export const Bootstrap: Story = {
  name: "Bootstrap",
  render: () => <PopoverStyleSample {...styleSamples[9]} />,
};

export const Cupertino: Story = {
  name: "Cupertino",
  render: () => <PopoverStyleSample {...styleSamples[10]} />,
};

export const AntDesign: Story = {
  name: "Ant Design",
  render: () => <PopoverStyleSample {...styleSamples[11]} />,
};

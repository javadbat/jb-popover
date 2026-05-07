import type { JBPopoverWebComponent } from "jb-popover";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      'jb-popover': JBPopoverType;
    }
    interface JBPopoverType extends React.DetailedHTMLProps<React.HTMLAttributes<JBPopoverWebComponent>, JBPopoverWebComponent> {
    }
  }
}
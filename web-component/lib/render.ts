export function renderHTML(): string {
  return /* html */ `
  <div class="jb-popover-web-component">
    <div class="popover-background" aria-hidden="true"></div>
    <div class="popover-content-wrapper" part="content">
        <slot></slot>
    </div>
  </div>
  `;
}

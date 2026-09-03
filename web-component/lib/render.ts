export function renderHTML(): string {
  return /* html */ `
  <div class="jb-popover-web-component">
    <div class="popover-content" part="content">
        <slot></slot>
    </div>
  </div>
  `;
}

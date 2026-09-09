export function renderHTML(): string {
  return /* html */ `
  <div class="jb-popover-web-component">
    <div class="popover-backdrop" part="backdrop" aria-hidden="true"></div>
    <div class="popover-content" part="content" tabindex="-1">
        <div class="drag-handle" part="drag-handle" aria-hidden="true"><span></span></div>
        <slot></slot>
    </div>
  </div>
  `;
}

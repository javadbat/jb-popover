export function renderHTML(): string {
  return /* html */ `
  <div class="jb-popover-web-component">
    <div class="popover-backdrop" part="backdrop"></div>
    <div class="popover-content" part="content" tabindex="-1">
        <div class="drag-handle" part="drag-handle"><span></span></div>
        <slot part="content-slot"></slot>
    </div>
  </div>
  `;
}

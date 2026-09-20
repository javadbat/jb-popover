# JBPopover React Component

React wrapper for [jb-popover](../README.md). The wrapper registers the web component and applies options and anchor binding before opening.

## Installation

```sh
npm i jb-popover
```

```tsx
import { useRef, useState } from 'react';
import { JBPopover } from 'jb-popover/react';

function Example() {
  const anchor = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  return <>
    <button ref={anchor} onClick={() => setOpen(true)}>Choose a value</button>
    <JBPopover anchor={anchor} isOpen={open} aria-label="Choose a value"
      onClose={event => { if (!event.defaultPrevented) setOpen(false); }}>
      <div>Content</div>
    </JBPopover>
  </>;
}
```

## Props

| Prop | Type | Default | Meaning |
| --- | --- | --- | --- |
| `isOpen` | `boolean` | `false` | Requested open state. False starts dismissal. |
| `anchor` | `React.RefObject<HTMLElement \| null>` | none | Desktop anchor; binding and observation update when its target changes on render. |
| `positionArea` | `Partial<PositionArea>` | start/after | Preferred alignment; omitted fields use defaults. |
| `autoPlacement` | `boolean` | `true` | Flip and shift near viewport edges. Set false for exact placement. |
| `modal` | `boolean` or `'auto'` | `'auto'` | Auto makes mobile/tablet modal while desktop stays non-modal. |
| `closeOnEscape` | `boolean` | `true` | Escape requests dismissal of the topmost popover. |
| `restoreFocus` | `boolean` | `false` | Restore previous focus on close; opt in only for triggers that do not open on focus. |
| `autoCloseOnBackgroundClick` | `boolean` | `true` | Automatically close after an allowed backdrop request. |
| `swipeToClose` | `boolean` | `true` | Enable bottom-sheet handle/backdrop dragging. |
| `dragFromContent` | `boolean` | `false` | Also allow eligible content gestures at their scroll boundary. |
| `overflowHandler` | `'NONE'` or `'SLIDE'` | `'NONE'` | Legacy desktop hover correction. |
| `overflowDom` | `HTMLElement \| null` | `null` | Boundary for legacy overflow correction. |
| `id` | `string` | none | Enables owned mobile/tablet URL hash history. |
| `aria-label` | `string` | none | Accessible name of the modal dialog. |
| `ref` | `React.Ref<JBPopoverWebComponent>` | none | Imperative access to `open()`, `close()`, and read-only state. |
| `children` | `React.ReactNode` | none | Content in the default slot. |

## Events

| Prop | Event | Meaning |
| --- | --- | --- |
| `onLoad` | `load` | Connection started; can occur before React effects attach. |
| `onInit` | `init` | Connection initialization completed; can occur before React effects attach. |
| `onUrlOpen` | `url-open` | Opening from a matching hash; initial connection can precede effect attachment. |
| `onCancel` | `cancel` | Cancelable swipe/backdrop/Escape request. |
| `onClose` | `close` | Allowed dismissal request, or a browser-back notification. |
| `onClosed` | `closed` | The exit animation finished and the element's `isOpen` is false. |

`onCancel` and `onClose` use `JBPopoverCloseEvent`. `event.detail.eventType` identifies `SWIPE_DOWN`, `BACKGROUND_CLICK`, `ESCAPE_KEY`, or (onClose only) `HISTORY_BACK_EVENT`. `OUTSIDE_CLICK` and `CLOSE_BUTTON_CLICK` are reserved legacy reasons.

## Controlled open state

Use `onClose` to synchronize requested state after user dismissal. Keep the component mounted during exit. `onClosed` reports completion for programmatic and user closes. Calling `open()` during dismissal cancels that animation.

```tsx
<JBPopover isOpen={open} onClosed={() => console.log('Exit finished')}
  onClose={event => { if (!event.defaultPrevented) setOpen(false); }}>
  <div>Content</div>
</JBPopover>
```

## Preventing dismissal

```tsx
<JBPopover isOpen={open} aria-label="Edit filters"
  onCancel={event => {
    if (hasUnsavedChanges) event.preventDefault();
    console.log(event.detail.eventType);
  }}
  onClose={event => { if (!event.defaultPrevented) setOpen(false); }}>
  <div>Your form</div>
</JBPopover>
```

Cancellation must be synchronous. For asynchronous confirmation, prevent first and set `isOpen` to false after confirmation. Browser-back is not cancelable through `onCancel`.

## Anchor position

```tsx
<JBPopover anchor={anchor} isOpen={open}
  positionArea={{ inline: 'end', block: 'before' }} autoPlacement={false}>
  <div>Exactly aligned content</div>
</JBPopover>
```

`autoPlacement` is enabled by default. Inline values are `start`, `end`, `center`, `center-before`, and `center-after`; block values are `before` and `after`. Removing optional configuration props restores their defaults.

## Mobile swipe dismissal

Bottom sheets (up to 40rem) follow the finger, fade the backdrop, and dismiss by distance or a downward flick. Short or rejected swipes return smoothly and can be grabbed during the return animation. `swipeToClose={false}` disables all dragging. Tablet centered panels and desktop popovers do not drag.

Content dragging is opt-in. Scrollable ancestors must already be at the top when touch starts; reaching the top while scrolling requires a new gesture. Interactive controls, horizontal gestures, and `data-jb-popover-no-drag` regions are excluded.

```tsx
<JBPopover isOpen={open} dragFromContent aria-label="Choose a date">
  <div data-jb-popover-no-drag>Place a calendar or swiper here.</div>
  <div>Other content can start a sheet drag at its scroll boundary.</div>
</JBPopover>
```

## Accessibility and modal behavior

`modal="auto"` enables scroll locking, background inertness, focus containment, and dialog semantics on mobile/tablet. Supply `aria-label`. Initial focus goes to the first focusable content element with the `autofocus` attribute, falling back to the content container. Use `restoreFocus` to opt into restoring previous focus on close; it defaults to false to support triggers that open on focus. Set `modal={false}` for pickers that must keep focus in their input, or `modal` to make desktop modal too.

Escape requests dismissal unless `closeOnEscape={false}`. Modal popovers coordinate their scroll locks and topmost Escape behavior. Safe areas, oversized content, and visual-viewport changes are handled by the underlying component.

## Mobile URL hash state

Set `id` to enable mobile/tablet history. Entering mobile mode while already open creates an owned entry, preserving router state. The entry remains owned after resizing back to desktop. Existing matching deep links do not create duplicate entries. See [history details](../README.md#mobile-url-hash-state).

## Overflow handling

Prefer `autoPlacement` for viewport edges. `overflowHandler="SLIDE"` and optional `overflowDom` retain the legacy desktop hover correction.

## CSS parts and variables

The wrapper supports the same [CSS parts and variables](../README.md#css-parts-and-variables).

```css
.my-popover::part(backdrop) {
  background: rgb(0 0 0 / 40%);
  backdrop-filter: blur(8px);
}
```

Apply it with `<JBPopover className="my-popover">...</JBPopover>`.

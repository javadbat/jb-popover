# jb-popover

Responsive web component: an anchored popover on desktop, a centered tablet panel, and a draggable bottom sheet on mobile.

[Examples](https://javadbat.github.io/design-system/?path=/story/components-jbpopover--normal) | [React wrapper](./react/README.md) | [Styling](https://javadbat.github.io/design-system/?path=/docs/components-jbpopover-styling)

## Installation

```sh
npm i jb-popover
```

```js
import 'jb-popover';

const popover = document.querySelector('jb-popover');
popover.bindTarget(document.querySelector('#trigger'));
popover.open();
```

```html
<button id="trigger">Choose a value</button>
<jb-popover aria-label="Choose a value">
  <div>Your content</div>
</jb-popover>
```

## API reference

Options are JavaScript properties, not HTML attributes, unless listed as attributes below.

### Attributes

| Attribute | Meaning |
| --- | --- |
| `is-open` | Boolean attribute parsed by jb-core; opens or requests an animated close. |
| `id` | Enables an owned URL hash entry when opened in mobile/tablet mode. |
| `aria-label` | Accessible label for the internal dialog when modal behavior is active. |

### Properties

| Property | Type | Default | Meaning |
| --- | --- | --- | --- |
| `isOpen` | `boolean` (read-only) | `false` | Remains true through dismissal; false when the `closed` event fires. |
| `isMobileMode` | `boolean` (read-only) | viewport | True at widths up to 48rem, including tablets. |
| `isBottomSheet` | `boolean` (read-only) | viewport | True at widths up to 40rem. |
| `positionArea` | `{ inline?, block? }` | `{ inline: 'start', block: 'after' }` | Preferred desktop anchor alignment; partial assignments preserve other fields. |
| `autoPlacement` | `boolean` | `true` | Flip above/below when the opposite side has more room and shift inside the viewport with an 8px margin. |
| `swipeToClose` | `boolean` | `true` | Allow downward dismissal from the handle or backdrop on bottom sheets. |
| `dragFromContent` | `boolean` | `false` | Also allow eligible gestures starting in content. |
| `modal` | `boolean` or `'auto'` | `'auto'` | Auto enables modal behavior on mobile/tablet and leaves desktop non-modal. |
| `closeOnEscape` | `boolean` | `true` | Allow Escape to request dismissal of the topmost popover. |
| `restoreFocus` | `boolean` | `false` | Restore previous focus on close; opt in only for triggers that do not open on focus. |
| `autoCloseOnBackgroundClick` | `boolean` | `true` | Automatically close after an allowed backdrop-click request. |
| `overflowHandler` | `'NONE'` or `'SLIDE'` | `'NONE'` | Legacy desktop hover correction. Prefer automatic placement for viewport collisions. |
| `overflowDom` | `HTMLElement` or `null` | `null` | Boundary for legacy overflow correction; otherwise uses the viewport. |
| `PopoverHashPath` | `string` or `null` (read-only) | from `id` | Hash path for this instance. |
| `JBID` | `symbol` (read-only) | unique | Instance identifier. |

### Methods

| Method | Behavior |
| --- | --- |
| `open()` | Opens, positions, activates observers, and applies modal/history behavior. Interrupts an in-progress dismissal. |
| `close()` | Animates dismissal without dispatching a close request. Emits `closed` on completion. |
| `bindTarget(element)` | Bind or replace the desktop anchor, including while already open. |
| `unBindTarget()` | Remove the anchor and its observers. |
| `checkInitialOpenness()` | Check whether the URL hash addresses this popover; called on connection. |

### Events

| Event | Detail | Behavior |
| --- | --- | --- |
| `load` | none | Component connected, before internal listeners are registered. |
| `init` | none | Connection initialization completed. |
| `url-open` | none | The current URL hash caused opening. |
| `cancel` | `{ eventType }` | Cancelable request for swipe, backdrop, or Escape dismissal. |
| `close` | `{ eventType }` | Follows an allowed request; also cancelable for swipe/backdrop/Escape. Browser-back dispatches a notification. |
| `closed` | none | Non-cancelable completion event after any animated close, including programmatic close. |

Dismissal events bubble and cross shadow boundaries. The `close` event is a request/notification, not animation completion.

`event.detail.eventType` identifies the trigger:

| Value | Trigger |
| --- | --- |
| `SWIPE_DOWN` | A downward drag or flick crossed the dismissal threshold. |
| `BACKGROUND_CLICK` | The mobile/tablet backdrop was clicked. |
| `ESCAPE_KEY` | Escape was pressed while this was the topmost popover. |
| `HISTORY_BACK_EVENT` | Navigation left this instance's owned history entry. |
| `OUTSIDE_CLICK`, `CLOSE_BUTTON_CLICK` | Reserved legacy reasons. |

Use `event.preventDefault()` synchronously to reject a request. A rejected swipe returns smoothly. For asynchronous confirmation, prevent first and call `close()` after confirmation.

```js
popover.addEventListener('cancel', event => {
  if (hasUnsavedChanges) event.preventDefault();
  console.log(event.detail.eventType);
});
popover.addEventListener('closed', () => {
  console.log('Dismissal animation finished');
});
```

## Open and close

```js
popover.open();
popover.close(); // starts the exit animation
```

`isOpen` remains true until exit completes. Calling `open()` during exit cancels the dismissal. Reduced-motion preferences remove timed movement. Do not remove the element before `closed` if you want its exit animation to finish.

## Anchor position

Supported inline values: `start`, `end`, `center`, `center-before`, `center-after`.
Supported block values: `before`, `after`. Inline alignment follows the anchor's text direction.

```js
popover.positionArea = { inline: 'end', block: 'before' };
popover.autoPlacement = false; // use the requested alignment exactly
```

Anchor height/width changes, nested scroll containers, and shadow-root scroll ancestors are observed while open. Rebinding or reconnecting restores observation. Transformed containing blocks are included in coordinate calculations. Scroll-driven work is batched before repaint; closed popovers do not measure anchors on resize.

## Overflow handling

`autoPlacement` adjusts placement against the viewport. The legacy `overflowHandler = 'SLIDE'` shifts content upward on desktop mouse enter, using `overflowDom` when supplied; mouse leave restores it.

## Mobile swipe dismissal

At widths up to 40rem, drag from the handle, non-content sheet area, or anywhere on the backdrop. Drag beyond 30% of sheet height or flick downward to close. Content and backdrop follow the finger. A returning sheet can be grabbed again without jumping to its origin.

`dragFromContent` is disabled by default. If enabled, every scrollable ancestor must already be at the top when the touch starts. Reaching the top by scrolling requires a new gesture. Interactive controls and horizontal gestures are excluded.

```html
<jb-popover aria-label="Choose a date">
  <div data-jb-popover-no-drag>Place a calendar or swiper here.</div>
</jb-popover>
```

`data-jb-popover-no-drag` excludes the marked content region and its descendants. `swipeToClose = false` disables all sheet dragging. Tablet and desktop layouts do not use touch dismissal.

## Modal behavior and accessibility

With `modal = 'auto'`, mobile and tablet overlays lock page scrolling, make surrounding content inert, contain keyboard focus, and expose an internal `role="dialog"` with `aria-modal="true"`. Supply `aria-label` to name the dialog. Initial focus goes to the first focusable content element with `autofocus`, or the content container when none exists, before the background becomes inert. Set `restoreFocus = true` to restore previous focus on close. It defaults to false so focus-triggered pickers do not reopen after selection.

Set `modal = false` for non-modal pickers that need to retain input focus, or `modal = true` to opt into these behaviors on desktop. Desktop is non-modal by default. Escape targets the topmost popover; nested modal popovers keep scrolling locked until the final modal closes. These popovers coordinate with each other, not an application's independent overlay manager.

The sheet accounts for safe-area insets and visual-viewport height/offset changes, including space taken by a virtual keyboard. Oversized mobile content remains scrollable.

## Mobile URL hash state

An `id` enables a history entry when an open popover enters mobile/tablet mode. Router state fields are preserved. Once created, the entry remains owned through a resize back to desktop, so browser back still dismisses it. An existing matching deep link is not pushed again.

Closing consumes only the current entry owned by this instance. Disconnecting restores the previous URL/state for a current owned entry without navigating away. Avoid assigning the same id to multiple popovers. Browser-back remains a notification and does not use `cancel`.

## CSS parts and variables

| Part | Purpose |
| --- | --- |
| `content` | Sheet/panel content container. |
| `drag-handle` | Bottom-sheet drag area. |
| `backdrop` | Independent overlay background, blur, and fade. |

| CSS variable | Purpose |
| --- | --- |
| `--jb-popover-z-index` | Stacking order. |
| `--jb-popover-bg-color` | Content background. |
| `--jb-popover-back-bg-color` | Backdrop background. |
| `--jb-popover-handle-color` | Drag indicator color. |
| `--jb-popover-border-radius` | Content corner radius. |
| `--jb-popover-padding` | Desktop content padding. |
| `--jb-popover-box-shadow` | Content shadow. |
| `--jb-popover-top` | Unanchored desktop top position. |
| `--jb-popover-margin-top` | Desktop top margin. |

```css
jb-popover::part(backdrop) {
  background: rgb(0 0 0 / 40%);
  backdrop-filter: blur(8px);
}
```

## Tests

From the design-system repository root, run `deno task test --name=jb-popover`. This builds the package, checks formatting/types, and runs the popover Storybook and browser suites. See [test details](./tests/README.md).

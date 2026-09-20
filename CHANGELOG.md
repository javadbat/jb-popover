rrt# Changelog

## [2.0.0] - 2026-09-09

### Fixed

- Keep nested mobile sheets within the viewport by clearing the outer sheet's transform after its entrance animation. Added visible bounds and real click regression coverage.

- Made focus restoration opt-in with `restoreFocus` (default false), preventing focus-triggered consumers such as jb-date-input from reopening after selection.
- Only focus content marked with `autofocus` when a modal opens; otherwise focus the panel, preventing nested selectors from opening automatically.

### Added

- Added automatic desktop placement flipping and shifting, with `autoPlacement = false` for exact alignment.
- Added `modal` (`'auto'`, `true`, or `false`), focus containment/restoration, background inertness, shared modal scroll locking, and accessible dialog labeling.
- Added `closeOnEscape`, public `autoCloseOnBackgroundClick`, and the `ESCAPE_KEY` dismissal reason.
- Added `closed` / React `onClosed` to signal animation completion, plus React `onUrlOpen`.
- Added safe-area spacing and visual-viewport sizing for keyboard-aware mobile layouts.
- Added an interruptible return animation and consistent animated close behavior for programmatic, backdrop, keyboard, and swipe dismissal.
- Mobile bottom sheets support downward swipe dismissal from the backdrop or a visible handle, enabled by default with `swipeToClose`. Tablet centered panels and desktop popovers do not support dragging.f
- Added optional `dragFromContent` (default `false`), with scroll-boundary checks and `data-jb-popover-no-drag` exclusions for calendars, swipers, and other gesture controls.
- Added finger tracking, backdrop fading, distance-or-flick dismissal, animated return for incomplete or prevented gestures, and reduced-motion support.
- Added cancelable `cancel` requests for swipe and backdrop dismissal. `detail.eventType` identifies `SWIPE_DOWN` or `BACKGROUND_CLICK`.
- Added React `swipeToClose`, `dragFromContent`, and `onCancel` props, plus exported `JBPopoverCloseEvent` and `JBPopoverCloseEventType` types.
- Added the `drag-handle` CSS part and `--jb-popover-handle-color` styling variable.

### Changed

- `close()` now animates all dismissal paths; `isOpen` stays true until `closed` fires. Keep the component mounted to complete exit.
- Refactored positioning into its own controller, consolidated geometry updates before repaint, cached gesture elements/media queries, and removed closed-state resize measurements.
- React applies configuration and anchor binding before opening and restores defaults when optional props are removed.
- The normal scoped test command now builds jb-popover and runs both Storybook and browser suites.
- Moved backdrop fade effects off the outer wrapper and onto the dedicated backdrop to avoid an opacity layer around the blur. Added `part="backdrop"` for independent backdrop styling.
- The existing `close` event now bubbles, crosses shadow boundaries, and supports cancellation for swipe and backdrop requests, matching jb-modal's close-request model. Browser-back notifications retain their existing behavior.
- Breaking: updated the popover content part to the shared `content` contract.
- Breaking: renamed the public `urlOpen` event to `url-open`; the old event name is removed. The React handler remains `onUrlOpen`.

### Fixed

- Restart anchor observation when binding an already-open popover, rebinding, or reconnecting; observe anchor height and nested shadow-root scroll ancestors.
- Preserve router state and track history entries per instance through breakpoint changes; avoid duplicate entries for deep links.
- Updated stale Storybook open-state assertions to match the actual custom state.
- Clear desktop anchor offsets and overflow shifts when resizing into mobile/tablet mode, and resume anchor tracking when resizing back to desktop.

## [1.15.1] - 2026-08-26

### Fixed

- fix mobile overflow problem

## [1.15.0] - 2026-08-26

### Added

- Add Tablet Mode

## [1.14.0] - 2026-08-22

### Changed


- Made custom-element module evaluation SSR-safe by extending `JBBaseComponent` where needed and registering elements through the shared `defineWebComponent()` helper; raised the minimum `jb-core` version to `0.35.0`.
- Updated component color defaults to use the shared semantic content and surface tokens.

## [1.13.0] 2.26-07-18

### Added

- Added standard styling documentation, a live style gallery, and reusable custom theme recipes.
- Added `--jb-popover-box-shadow` as the public content-wrapper shadow API and documented it in component metadata.

### Changed

- Standardized theme recipes on `jb-popover.<theme>-style::part(content)` without redundant component hook classes.
- Replaced the hardcoded internal shadow with the public shadow variable so composed overlays can render one clean elevation treatment.

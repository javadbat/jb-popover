# Changelog

## Unreleased

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

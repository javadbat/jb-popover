# Changelog

## [1.13.0] 2.26-07-18

### Added

- Added standard styling documentation, a live style gallery, and reusable custom theme recipes.
- Added `--jb-popover-box-shadow` as the public content-wrapper shadow API and documented it in component metadata.

### Changed

- Standardized theme recipes on `jb-popover.<theme>-style::part(content)` without redundant component hook classes.
- Replaced the hardcoded internal shadow with the public shadow variable so composed overlays can render one clean elevation treatment.

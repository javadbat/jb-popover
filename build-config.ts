import type { ReactComponentBuildConfig, WebComponentBuildConfig } from "../../tasks/build/builder/src/types.ts";

export const webComponentList: WebComponentBuildConfig[] = [
  {
    name: "jb-popover",
    path: "./lib/jb-popover.ts",
    outputPath: "./dist/jb-popover.js",
    external: ["jb-core", "jb-core/theme"],
    globals:{
      "jb-core":"JBCore",
      "jb-core/theme":"JBCoreTheme",
    },
    umdName: "JBPopover",
  },
];
export const reactComponentList: ReactComponentBuildConfig[] = [];
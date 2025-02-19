import type { ReactComponentBuildConfig, WebComponentBuildConfig } from "../../tasks/build/builder/src/types.ts";

export const webComponentList: WebComponentBuildConfig[] = [
  {
    name: "jb-popover",
    path: "./lib/jb-popover.ts",
    outputPath: "./dist/jb-popover.js",
    external: ["jb-core"],
    globals:{
      "jb-core":"JBCore",
    },
    umdName: "JBPopover",
  },
];
export const reactComponentList: ReactComponentBuildConfig[] = [];
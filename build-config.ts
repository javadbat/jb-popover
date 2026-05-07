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
export const reactComponentList: ReactComponentBuildConfig[] = [
  {
    name:"jb-popover-react",
    path: "./react/lib/JBPopover.tsx",
    outputPath: "./react/dist/JBPopover.js",
    external: ["jb-popover", "react","jb-core", "jb-core/react"],
    globals: {
      react: "React",
      "jb-popover":"JBPopover",
      "jb-core": "JBCore",
      "jb-core/react": "JBCoreReact",
    },
    umdName: "JBPopoverReact",
    dir: "./react"
  }
];
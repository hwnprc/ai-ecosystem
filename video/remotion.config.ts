import path from "node:path";
import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(92);
Config.setCodec("h264");
Config.setPixelFormat("yuv420p"); // plays everywhere, including X
Config.setColorSpace("bt709");

// The video reuses the web app's data and layout from ../src.
// "@" points there, and packages resolve from this folder's node_modules.
Config.overrideWebpackConfig((config) => ({
  ...config,
  resolve: {
    ...config.resolve,
    alias: { ...(config.resolve?.alias ?? {}), "@": path.join(process.cwd(), "../src") },
    modules: [path.join(process.cwd(), "node_modules"), "node_modules"],
  },
}));

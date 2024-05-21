const { build } = require("esbuild");

const baseConfig = {
  bundle: true,
  minify: process.env.NODE_ENV === "production",
  sourcemap: process.env.NODE_ENV !== "production",
  define: {
    "process.env.NEW_RELIC_API_KEY": JSON.stringify(process.env.NEW_RELIC_API_KEY ?? ""),
    "process.env.ENVIRONMENT": JSON.stringify(process.env.ENVIRONMENT ?? "debugging"),
  },
  loader: {
    ".png": "dataurl",
    ".woff": "dataurl",
    ".woff2": "dataurl",
    ".eot": "dataurl",
    ".ttf": "dataurl",
    ".svg": "dataurl",
  },
};

const extensionConfig = {
  ...baseConfig,
  platform: "node",
  mainFields: ["module", "main"],
  format: "cjs",
  entryPoints: ["./src/host/extension.ts"],
  outfile: "./dist/extension.js",
  external: ["vscode"],
};

const webConfig = {
  ...baseConfig,
  target: "es6",
  format: "esm",
  entryPoints: ["./src/web/main.ts"],
  outfile: "./dist/web.js",
};

(async () => {
  const buildConfigs = [extensionConfig, webConfig];
  try {
    for (const config of buildConfigs) {
      await build(config);
    }
    console.log("build complete");
  } catch (err) {
    process.stderr.write(err.stderr);
    process.exit(1);
  }
})();

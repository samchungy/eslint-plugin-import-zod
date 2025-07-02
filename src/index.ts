import preferZodNamespace from "./rules/prefer-zod-namespace";
import { TSESLint } from "@typescript-eslint/utils";

// Create the base plugin object
const plugin = {
  meta: {
    name: "import-zod",
    version: "1.0.0",
  },
  rules: {
    "prefer-zod-namespace": preferZodNamespace,
  },
  configs: {},
} satisfies TSESLint.Linter.Plugin;

Object.assign(plugin.configs, {
  recommended: [
    {
      plugins: {
        "import-zod": plugin,
      },
      rules: {
        "import-zod/prefer-zod-namespace": "error",
      },
    },
  ] satisfies TSESLint.FlatConfig.ConfigArray,
});

export = plugin;

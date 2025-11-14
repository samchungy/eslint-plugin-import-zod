import preferZodNamespace from "./rules/prefer-zod-namespace";
import { TSESLint } from "@typescript-eslint/utils";
import type { ESLint, Linter } from "eslint";

// Create the base plugin object
const importZod = {
  meta: {
    name: "import-zod",
    version: "1.0.0",
  },
  rules: {
    "prefer-zod-namespace": preferZodNamespace as unknown as NonNullable<
      ESLint.Plugin["rules"]
    >[string],
  },
  configs: {} as {
    recommended: Linter.Config[];
  },
} satisfies ESLint.Plugin;

Object.assign(
  importZod.configs as NonNullable<TSESLint.Linter.Plugin["configs"]>,
  {
    recommended: [
      {
        plugins: {
          "import-zod": importZod,
        },
        rules: {
          "import-zod/prefer-zod-namespace": "error",
        },
      },
    ] satisfies Linter.Config[],
  }
);

export = importZod;

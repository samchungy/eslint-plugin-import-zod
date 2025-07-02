import rule from "../src/rules/prefer-zod-namespace";

import * as vitest from "vitest";
import { RuleTester } from "@typescript-eslint/rule-tester";

RuleTester.afterAll = vitest.afterAll;

// If you are not using vitest with globals: true (https://vitest.dev/config/#globals):
RuleTester.it = vitest.it;
RuleTester.itOnly = vitest.it.only;
RuleTester.describe = vitest.describe;

const ruleTester = new RuleTester();

ruleTester.run("prefer-zod-namespace-import", rule, {
  valid: [
    // Namespace import is valid
    "import * as z from 'zod';",
    // Namespace import is valid
    "import * as z from 'zod/v4';",
    // Type namespace import is valid
    "import type * as z from 'zod';",
    // Other imports from zod that don't include 'z' are valid
    "import { toJSONSchema } from 'zod';",
    // Other type imports from zod that don't include 'z' are valid
    "import type { toJSONSchema } from 'zod';",
    // Default import would be valid (though zod doesn't have one)
    "import zod from 'zod';",
    // Imports from other modules are valid
    "import { z } from 'not-zod';",
  ],
  invalid: [
    // Import cases
    // Simple case: only z is imported
    {
      code: "import { z } from 'zod';",
      output: "import * as z from 'zod';",
      errors: [{ messageId: "preferNamespaceImport" }],
    },
    {
      code: "import { z } from 'zod/v4';",
      output: "import * as z from 'zod/v4';",
      errors: [{ messageId: "preferNamespaceImport" }],
    },
    // Type-only import case
    {
      code: "import type { z } from 'zod';",
      output: "import type * as z from 'zod';",
      errors: [{ messageId: "preferNamespaceImport" }],
    },
    // Complex case: z is imported along with other exports
    {
      code: "import { toJSONSchema, z } from 'zod';",
      output: "import * as z from 'zod';\nimport { toJSONSchema } from 'zod';",
      errors: [{ messageId: "preferNamespaceImport" }],
    },
    // Complex type-only import case
    {
      code: "import type { toJSONSchema, z } from 'zod';",
      output:
        "import type * as z from 'zod';\nimport type { toJSONSchema } from 'zod';",
      errors: [{ messageId: "preferNamespaceImport" }],
    },
    // Case with renamed import
    {
      code: "import { z as zodSchema } from 'zod';",
      output: "import * as zodSchema from 'zod';",
      errors: [{ messageId: "preferNamespaceImport" }],
    },
    // Complex case with renamed imports
    {
      code: "import { toJSONSchema as schema, z } from 'zod';",
      output:
        "import * as z from 'zod';\nimport { toJSONSchema as schema } from 'zod';",
      errors: [{ messageId: "preferNamespaceImport" }],
    },
    // Type import case with z
    {
      code: "import { type ZodError, z } from 'zod';",
      output: "import * as z from 'zod';\nimport { type ZodError } from 'zod';",
      errors: [{ messageId: "preferNamespaceImport" }],
    },
    // Case where z appears before other imports
    {
      code: "import { z, toJSONSchema } from 'zod';",
      output: "import * as z from 'zod';\nimport { toJSONSchema } from 'zod';",
      errors: [{ messageId: "preferNamespaceImport" }],
    },
  ],
});

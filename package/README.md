# eslint-plugin-import-zod

ESLint plugin to enforce namespace imports for zod.

## Installation

```bash
npm install eslint-plugin-import-zod --save-dev
```

## Usage

```js
// eslint.config.js
import importZod from "eslint-plugin-import-zod";

export default [
  // Include the plugin's recommended config
  importZod.configs.recommended,

  // Or configure it manually
  {
    plugins: {
      "import-zod": importZod,
    },
    rules: {
      "import-zod/prefer-zod-namespace": "error",
    },
  },
];
```

## Rules

### [`prefer-zod-namespace`](docs/rules/prefer-zod-namespace.md)

This rule enforces using namespace imports and exports for zod instead of named imports and exports.

#### ❌ Invalid

```js
// Importing z directly
import { z } from "zod";

// Type-only imports
import type { z } from "zod";

// Importing z along with other exports
import { ZodError, z } from "zod";

// Type-only imports with multiple exports
import type { ZodError, z } from "zod";

// Importing z with type modifiers
import { type ZodError, z } from "zod";

// Re-exporting z directly
export { z } from "zod";

// Re-exporting z along with other exports
export { ZodError, z } from "zod";
```

#### ✅ Valid

```js
// Using namespace import
import * as z from "zod";

// Using type namespace import
import type * as z from "zod";

// Other imports from zod that don't include 'z'
import { ZodError } from "zod";

// Type imports that don't include 'z'
import type { ZodError } from "zod";

// Re-exporting z as a namespace
export * as z from "zod";

// Re-exporting other exports that don't include 'z'
export { ZodError } from "zod";
```

#### Auto-fix

This rule is automatically fixable. When using `--fix`, ESLint will:

- Convert `import { z } from 'zod';` to `import * as z from 'zod';`
- Convert `import type { z } from 'zod';` to `import type * as z from 'zod';`
- Split mixed imports like `import { ZodError, z } from 'zod';` into:
  ```js
  import * as z from "zod";
  import { ZodError } from "zod";
  ```
- Split type imports like `import type { ZodError, z } from 'zod';` into:
  ```js
  import type * as z from "zod";
  import type { ZodError } from "zod";
  ```
- Preserve type modifiers in mixed imports like `import { type ZodError, z } from 'zod';`:
  ```js
  import * as z from "zod";
  import { type ZodError } from "zod";
  ```
- Convert `export { z } from 'zod';` to `export * as z from 'zod';`
- Split mixed exports like `export { ZodError, z } from 'zod';` into:
  ```js
  export * as z from "zod";
  export { ZodError } from "zod";
  ```

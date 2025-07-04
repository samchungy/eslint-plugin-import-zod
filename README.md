# eslint-plugin-import-zod

<a href="https://www.npmjs.com/package/eslint-plugin-import-zod"><img src="https://img.shields.io/npm/v/eslint-plugin-import-zod"/></a>
<a href="https://nodejs.org/en/"><img src="https://img.shields.io/node/v/eslint-plugin-import-zod"/></a>

ESLint plugin to enforce namespace imports for zod. This plugin provides a rule that ensures all imports of zod use the namespace import style (`import * as z from "zod";`) instead of named imports to promote better tree-shaking and reduce bundle sizes. See [this Zod issue comment](https://github.com/colinhacks/zod/issues/4433#issuecomment-2921500831) for a more detailed explanation.

## Installation

```bash
pnpm add -D eslint-plugin-import-zod
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

This rule enforces using namespace imports for zod instead of named imports.

#### ❌ Invalid

```js
// Importing z directly
import { z } from "zod";

// Importing z from 'zod/v4'
import { z } from "zod/v4";

// Importing z from 'zod/v4-mini'
import { z } from "zod/v4-mini";

// Type-only imports
import type { z } from "zod";

// Importing z along with other exports
import { ZodError, z } from "zod";

// Type-only imports with multiple exports
import type { ZodError, z } from "zod";

// Importing z with type modifiers
import { type ZodError, z } from "zod";

// Importing submodules from zod/v4
import { core } from "zod/v4";
```

#### ✅ Valid

```js
// Using namespace import
import * as z from "zod";

// Importing z from 'zod/v4'
import * as z from "zod/v4";

// Importing z from 'zod/v4-mini'
import * as z from "zod/v4-mini";

// Using type namespace import
import type * as z from "zod";

// Other imports from zod that don't include 'z'
import { ZodError } from "zod";

// Type imports that don't include 'z'
import type { ZodError } from "zod";

// Importing submodule as namespace with proper path
import * as core from "zod/v4/core";
```

#### Auto-fix

This rule is automatically fixable. When using `--fix`, ESLint will:

- Convert `import { z } from 'zod';` to `import * as z from 'zod';`
- Convert `import type { z } from 'zod';` to `import type * as z from 'zod';`
- Convert `import { core } from 'zod/v4';` to `import * as core from 'zod/v4/core';`
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

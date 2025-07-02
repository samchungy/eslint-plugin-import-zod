# Enforce namespace imports for zod (prefer-zod-namespace)

This rule enforces using namespace imports and exports for zod instead of named imports and exports. Using namespace imports results in better tree-shaking and reduced bundle sizes.

## Rule Details

This rule aims to enforce a consistent pattern for importing and exporting zod.

### ❌ Invalid

```js
// Importing z directly
import { z } from "zod";

// Type imports
import type { z } from "zod";

// Importing z with type modifiers
import { type ZodError, z } from "zod";

// Importing z along with other exports
import { ZodError, z } from "zod";

// Type-only imports with multiple exports
import type { ZodError, z } from "zod";

// Re-exporting z directly
export { z } from "zod";

// Re-exporting z along with other exports
export { ZodError, z } from "zod";

// Re-exporting z with a different name
export { z as zodSchema } from "zod";
```

### ✅ Valid

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

## Options

This rule has no options.

## When Not To Use It

You should not use this rule if you prefer to use named imports for zod or if you have a specific reason to import `z` directly.

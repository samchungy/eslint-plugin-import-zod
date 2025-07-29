# Enforce namespace imports for zod (prefer-zod-namespace)

This rule enforces using namespace imports for zod instead of named imports or default imports. Using namespace imports results in better tree-shaking and reduced bundle sizes. All default imports from 'zod' are converted to namespace imports regardless of the import name.

## Rule Details

This rule aims to enforce a consistent pattern for importing zod.

### ❌ Invalid

```js
// Importing z directly
import { z } from "zod";

// Default import
import z from "zod";

// Type default import
import type z from "zod";

// Mixed default and named imports
import z, { toJSONSchema } from "zod";

// Default imports with any name
import zod from "zod";
import zodSchema from "zod";

// Type imports
import type { z } from "zod";

// Importing z with type modifiers
import { type ZodError, z } from "zod";

// Importing z along with other exports
import { ZodError, z } from "zod";

// Type-only imports with multiple exports
import type { ZodError, z } from "zod";

// Importing core from zod/v4
import { core } from "zod/v4";
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

// Importing core as namespace from proper path
import * as core from "zod/v4/core";
```

## Options

This rule has no options.

## When Not To Use It

You should not use this rule if you prefer to use named imports for zod or if you have a specific reason to import `z` directly`.

---
"eslint-plugin-import-zod": minor
---

Default imports are now converted to namespace imports

```ts
import z from "zod";
```

to

```ts
import * as z from "zod";
```

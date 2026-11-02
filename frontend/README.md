# frontend

To install dependencies:

```bash
bun install
```

To start a development server:

```bash
bun dev
```

To run for production:

```bash
bun start
```

To type check:

```bash
bun check
```

QA (oxfmt, oxlint, `bun check`, `bun test`):

```bash
bun run verify  # read-only: format-check, lint, typecheck, test
bun run all     # rewrites files: format, lint-fix, typecheck, test
```

This project was created using `bun init` in bun v1.4.4. [Bun](https://bun.com) is a fast all-in-one JavaScript runtime.

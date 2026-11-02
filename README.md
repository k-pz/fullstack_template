# fullstack_template

Django + DRF backend, Bun + React + Tailwind + shadcn/ui frontend, tied together with [mise](https://mise.jdx.dev).

## Start a project from this template

```sh
gh repo create <name> --private --template k-pz/fullstack_template --clone
cd <name>
mise install                                              # bun, uv (python comes from backend/.python-version)
(cd backend && uv sync && uv run python manage.py migrate)
(cd frontend && bun install)
mise run dev                                              # Django on :8000, frontend on :3000
```

Then set the project name in `backend/pyproject.toml` and the page title in `frontend/src/index.html`.

## Tasks

| Task | Does |
|------|------|
| `mise run dev` | starts both dev servers |
| `mise run check` | read-only QA for both: format-check, lint, typecheck, test |
| `mise run backend:fix` / `frontend:fix` | QA that rewrites files |

The frontend dev server forwards `/api/*` to Django.

## Production build

```sh
(cd frontend && bun run build)   # static SPA in frontend/dist/
```

`frontend/dist/` is plain static files, so any static host works (nginx, Caddy, S3, Netlify, ...). On the host:

- Serve `index.html` for any path that isn't a file, so client-side routes survive a reload.
- Route `/api/` and `/admin/` to Django on the same origin. The `/api` forwarding only exists in the dev server.

Asset URLs are absolute, so the app must live at the domain root; to host it under a subpath, change `publicPath` in `frontend/build.ts`. `BUN_PUBLIC_*` env vars are baked in at build time.

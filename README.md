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

The frontend dev server forwards `/api/*` to Django. Stack conventions live in `backend/CLAUDE.md` and `frontend/CLAUDE.md`.

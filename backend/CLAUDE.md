Default to using uv for everything Python. Run commands from `backend/`.

- Use `uv run <cmd>` instead of activating `.venv` or calling `python`/`pip` directly
- Use `uv add <pkg>` / `uv add --dev <pkg>` instead of `pip install` or editing `pyproject.toml` by hand
- Use `uv sync` instead of `pip install -r requirements.txt`. There is no `requirements.txt`; `uv.lock` is the lockfile.
- Use `uv run python manage.py <command>` for Django commands (`runserver`, `makemigrations`, `migrate`, `createsuperuser`, `shell`)
- Use `uv run poe <task>` for project tasks (defined in `[tool.poe.tasks]` in `pyproject.toml`)
- Python version is pinned in `.python-version` (3.14). Use modern syntax; ruff's `UP` rules enforce it.

## Tasks

| Task | Runs | Notes |
|------|------|-------|
| `uv run poe test` | `pytest` | |
| `uv run poe lint` | `ruff check` | `lint-fix` applies fixes |
| `uv run poe format-check` | `ruff format --check` | `format` rewrites files |
| `uv run poe typecheck` | `ty check` | warnings are errors |
| `uv run poe all` | format, lint-fix, typecheck, test | modifies files |
| `uv run poe check` | format-check, lint, typecheck, test | read-only |

- Use `ruff` instead of `black`, `isort`, or `flake8`. Line length is 120.
- Use `ty` instead of `mypy` or `pyright`. `django-types` provides the Django stubs.
- Use `pytest` + `pytest-django` instead of `manage.py test` or `unittest.TestCase`.

## Stack

- Django + Django REST Framework. Don't add FastAPI, Flask, or Ninja.
- Build API endpoints with DRF `ModelSerializer` + `ModelViewSet`, registered on the `DefaultRouter` in `src/backend/urls.py`. Don't write plain Django views returning `JsonResponse`.
- SQLite (`db.sqlite3`) via the Django ORM. Don't write raw SQL or add SQLAlchemy.
- `django-cors-headers` lets the frontend dev server (`http://localhost:3000`) call the API. Add new frontend origins to `CORS_ORIGIN_WHITELIST` in settings.

## Layout

```
src/backend/   project package: settings.py, urls.py, asgi.py, wsgi.py
src/<app>/     one package per Django app: models, serializers, views, admin, migrations
tests/         pytest tests
```

- `src/` layout: packages are importable as `backend` and `<app>` (not `src.<app>`).
- The API lives under `/api/`, e.g. `/api/items/` and `/api/items/<id>/`. Admin is at `/admin/`.
- Create an app with `mkdir src/<app> && uv run python manage.py startapp <app> src/<app>`, then add it to `INSTALLED_APPS`.
- After changing a model, run `uv run python manage.py makemigrations` and commit the migration. Never edit applied migrations. Ruff skips `migrations/`.

## Testing

Use `uv run poe test` to run tests. Mark tests that touch the database with `@pytest.mark.django_db`. Use pytest-django's `client` fixture for API tests.

```py#tests/test_items.py
import pytest

from items.models import Item


@pytest.mark.django_db
def test_create_item_via_api(client):
    response = client.post("/api/items/", {"name": "Milk"}, content_type="application/json")

    assert response.status_code == 201
    assert Item.objects.get().name == "Milk"
```

## Running

```sh
uv run python manage.py migrate
uv run python manage.py runserver   # http://localhost:8000/api/
```

`SECRET_KEY` reads `DJANGO_SECRET_KEY` from the environment; the fallback is for local dev only.

Before finishing a change, run `uv run poe lint`, `uv run poe format-check`, `uv run poe typecheck` and `uv run poe test`.

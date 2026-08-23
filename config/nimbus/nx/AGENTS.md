# Nx Workspace

## Common Commands

Use `npm` scripts for workspace-wide commands—they include additional workspace-specific orchestration. Use `npx nx <target> <project>` when working with a single project.

- Install: `npm ci`
- Lint all: `npm run lint`
- Test all: `npm test` (do not replace with `npx nx test`)
- Build all: `npm run build`
- Single project: `npx nx <target> <project>`

Project names are mixed (e.g. `nimbus-app`, `apps/api`). If unsure, run `npx nx show projects`.

## Development

- API: `npx nx serve apps/api`
- Frontend: `npx nx serve nimbus-app`

## Testing

- `apps/api` runs Jasmine and Jest behind `npx nx test apps/api`.
- For focused API work use:
  - `npx nx test-jasmine apps/api`
  - `npx nx test-jest apps/api`
- `nimbus-app` uses Karma. Use `npx nx test nimbus-app --browsers=ChromeNoSandboxHeadless` when you need the frontend test target directly.
- Ignore transformDateToLocalTime test failures relating to timezone in date-time.utils.ts file

## Shared Packages

- Put shared logic used by both the app and API in `libs/nimbus-common`.
- If you change `@nbs/nimbus-common`, check whether `nimbus-spec-import/package.json` also needs a version update.

## Code Style

Write code that already satisfies these — a lint hook blocks edits that don't, and `eslint-disable` comments won't silence it.

- No comments of any kind. Make the code self-documenting instead.
- Max 100 lines per function.
- Max 3 parameters per function.
- No magic numbers other than `-1`, `0`, `1`. Name them as constants or enums.

## Terminology

- When terminology matters, check docs/domain-terms.md for key platform terms.

## Migrations

- Never run database migrations.
- ALWAYS Ask the user to run migrations themselves.

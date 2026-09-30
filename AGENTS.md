# AGENTS.md

This repository is a small Angular 22 app for a Cerner SMART launch flow. Keep changes aligned with the current patterns in the app and prefer minimal, targeted edits.

## Project context
- App entry is Angular with standalone components and `signals`.
- See [README.md](README.md) for the basic build/test workflow.
- The codebase is intentionally compact; prefer editing existing components over introducing new architectural layers.
- Use TypeScript conventions already present in the project: strong typing, `readonly` signals, and direct dependency injection via `inject(...)`.

## Coding conventions
- Keep indentation with spaces and match the existing formatting in nearby files.
- Prefer standalone component patterns already used in `src/app/*.ts` and component folders.
- For component metadata, use the existing style: `selector`, `imports`, `templateUrl`, and `styleUrl`.
- Preserve existing naming conventions, even when they look misspelled (for example, the current `practictioner-launch` naming is already used across the app).
- Keep business logic near the component that owns it; do not introduce a larger service layer unless the feature clearly warrants it.
- Authentication and SMART session state is stored in browser `localStorage`; when changing auth flow, preserve the current keys and behavior.

## Commands
- Start the app: `npm start`
- Build the app: `npm run build`
- Run tests: `npm test`

## Working tips for agents
- Prefer local, component-scoped fixes over broad refactors.
- When changing the SMART launch flow, verify the `iss`, `launch`, `token_endpoint`, and `smart_session` handling still matches the current browser redirect behavior.
- If you add new UI, follow the existing component structure under `src/app/components` and reuse the same CSS/HTML conventions.
- Avoid broad formatting-only changes in the same commit as functional fixes.

## Related file map
- `src/app/app.ts` — app root and component registration
- `src/app/app.routes.ts` — route config
- `src/app/components/practictioner-launch/practictioner-launch.ts` — SMART auth/token logic
- `src/app/components/patient-banner/patient-banner.ts` — patient display component

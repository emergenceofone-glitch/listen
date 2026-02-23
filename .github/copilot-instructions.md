Project Emergence — Copilot / AI Agent Instructions
===============================================

Purpose
-------
This file gives focused, actionable information for AI coding agents working in this repository so they are productive immediately. It is intentionally concise and example-driven.

Big picture (what to know first)
--------------------------------
- Frontend: `src/app` — Next.js 14 App Router + React. Primary UI is the Nexus (`src/app/nexus/page.tsx`).
- State & data layer: Supabase (real-time) via `src/lib/supabase.ts` and `src/lib/nexus-store.ts`.
- AI flows: `src/ai` contains Genkit flows and glue (`genkit.ts`, `flows/*`). Use these when adding or modifying vessel behavior.
- Infra: `template.yaml` is an AWS SAM template that references `packages/hello_world/` for a Lambda used by Genkit endpoints.

Immediate developer workflows & commands
--------------------------------------
- Install: `npm install`
- Dev server: `npm run dev` (Next.js at http://localhost:3000)
- Build: `npm run build` and `npm start` for production preview
- Lint: `npm run lint` (uses `next lint`)
- Tests: project uses `vitest` and `@testing-library/react` (see `__tests__/nexus-store.test.ts`). Run tests with your preferred vitest command; repository does not expose a `test` script by default.

Required runtime env vars (local/dev)
------------------------------------
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL (used by `src/lib/supabase.ts`).
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key.
- `GOOGLE_API_KEY` (or `GOOGLE_API_KEY` secret referenced by `template.yaml`) — used by Genkit/AWS Lambda flows.
- Put values in `.env.local` for local Next.js dev.

Key integration points & patterns (concrete examples)
---------------------------------------------------
- Supabase-backed stores: `src/lib/nexus-store.ts` implements canonical read/write/subscribe patterns for these tables: `vessels`, `artifacts`, `hlog_events`, `vcp_signals`, `projects`, `simulations`, `simulation_runs`.
  - Follow the pattern: CRUD method -> `HLogStore.record(...)` for observable changes -> optionally `VCPStore.broadcast(...)` for inter-agent signals.
  - Example: `ArtifactStore.synthesize(...)` creates artifact, logs via `HLogStore`, and broadcasts a `SYNTHESIS_READY` VCP signal.
- Real-time subscription API: use `supabase.channel(...).on('postgres_changes', ...)` for client updates; helpers exist in each Store (`subscribeToChanges` / `subscribeToSignals`).
- Vessel conventions: see `Vessel` type in `nexus-store.ts`. Vessel seed is created with `VesselStore.seedGenesisBatch()`; capabilities and `faculty` fields are used across UI and AI flows.

Code patterns and conventions to preserve
---------------------------------------
- Type-first approach: stores expose typed interfaces (e.g., `Vessel`, `Artifact`) in `src/lib/nexus-store.ts`. Keep types and DB table fields aligned.
- Logging: every significant data mutation should call `HLogStore.record(...)` so the UI H_log can surface changes.
- Signaling: cross-agent communication uses `VCPStore.broadcast(...)` and `vcp_signals` rows. New flows that trigger agent-to-agent actions should use this channel.
- Genesis / seeds: initial domain objects (vessels) are created via `seedGenesisBatch()` — prefer using this helper when adding test/demo data.

Architecture notes useful for changes
-----------------------------------
- PWA behavior is controlled in `next.config.js` by `@ducanh2912/next-pwa` and disabled during development (watch `disable: process.env.NODE_ENV === "development"`).
- The AWS SAM `template.yaml` maps `/ai/*` to `packages/hello_world` — changes that affect Genkit/GenAI endpoints may require updating both Next.js client code in `src/ai` and the Lambda handler code in `packages/hello_world`.

When editing data models or stores
---------------------------------
- Update the TypeScript interfaces in `src/lib/nexus-store.ts` first.
- Ensure DB columns referenced in store methods match Supabase schema (table names listed above).
- Preserve `HLogStore.record(...)` calls so UI and analytics remain consistent.

Testing and verification tips
-----------------------------
- To validate Supabase flows locally: set env vars to a test Supabase project and run `npm run dev`. Use browser devtools to watch subscriptions and network requests to the Supabase realtime channels.
- Unit tests live under `__tests__`. Use `vitest` to run and iterate quickly.

Files to inspect when adding features
------------------------------------
- Frontend routes & UI: `src/app/*`, especially `src/app/nexus/page.tsx` for core UX.
- AI flows: `src/ai/*` (Genkit flows and adapters).
- Stores & data contracts: `src/lib/nexus-store.ts`, `src/lib/supabase.ts`, `src/lib/integration-engine.ts`.
- Infra glue: `template.yaml` and `packages/hello_world` for the serverless Genkit endpoint.

What not to change without review
--------------------------------
- The canonical table names and the shape of rows in `nexus-store.ts`—changing these requires DB migrations and frontend updates.
- The `VCP` signal enum values (`SYNTHESIS_READY`, etc.) — other vessels rely on these exact string values.

If you need clarification
------------------------
- Ask which Supabase project/dev credentials to use, whether you should run `seedGenesisBatch()` to populate demo data, and whether Lambda changes must be deployed.

End of instructions — please ask for clarifications or point to a specific task to iterate.

PRs, Commits & Quick Commands
----------------------------
- PR checklist: include a short summary, list of changed files, relevant env vars, and verification steps. Link to changed files in the PR description and include screenshots for UI changes.
- Commit message convention: `type(scope): short description` (e.g., `feat(ai): add Vessel seed helper`). Use `fix`, `feat`, `chore`, `docs`, `test` where appropriate.
- Common commands:
  - Install: `npm install`
  - Dev server: `npm run dev`
  - Build: `npm run build`
  - Lint: `npm run lint`
  - Run unit tests (vitest): `npx vitest` or your preferred `vitest` invocation
  - Seed genesis vessels (if needed): run the `scripts/seed-genesis.mjs` script with Node (ensure env vars set):

```bash
node scripts/seed-genesis.mjs
```

If additional CI, release, or deployment steps exist, add them to this file so agents can reference them.

CI, Supabase & Repo Ops (examples)
----------------------------------
- Example GitHub Actions CI (basic build/test): `.github/workflows/ci.yml` — runs install, lint, build, and tests on Node 18. Use this as a template for adding more jobs (deploy, e2e, security scans).
- Secrets / env setup for CI: add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `GOOGLE_API_KEY` to the repository Secrets in GitHub when enabling CI that needs them.
- Local Supabase guidance: prefer a dedicated dev/test Supabase project. Do not run integration tests against production DB. When seeding or running `scripts/seed-genesis.mjs`, ensure `.env.local` points to a non-production DB.

`src/ai` developer notes (Genkit & flows)
---------------------------------------
- Entry points: `src/ai/genkit.ts` wires Genkit clients; `src/ai/flows/*` contains high-level flows like `generate-code.ts` and `generate-enhanced-analysis.ts`.
- When modifying flows:
  - Update flow inputs/outputs in `genkit.ts` and adjust any UI callers under `src/app/*`.
  - Use `VesselStore` and `ArtifactStore` for persistent data and call `HLogStore.record(...)` for observable events.
  - For cross-vessel signaling, emit `VCPStore.broadcast(...)` with the known `signal_type` strings.

  Concrete Genkit examples (from `src/ai`)
  --------------------------------------
  - `src/ai/genkit.ts` exports a configured `ai` instance:

  ```ts
  import { genkit } from 'genkit';
  import { googleAI } from '@genkit-ai/google-genai';

  export const ai = genkit({ plugins: [ googleAI() ] });
  ```

  - Typical flow pattern (see `src/ai/flows/generate-code.ts`):
    - Define input/output schemas via `z` (Genkit + Zod)
    - Create a prompt with `ai.definePrompt(...)`
    - Wrap prompt in a flow with `ai.defineFlow(...)`
    - Invoke prompt/flow with a model instance e.g. `googleAI.model('gemini-1.5-flash')`

  Example usage (server action or backend):

  ```ts
  import { generateCode } from '@/ai/flows/generate-code';

  const result = await generateCode({ analysisReport: '...', componentType: 'frontend', requirements: '...' });
  // result.generatedCode contains the produced source
  ```

  Notes:
  - Flows live in `src/ai/flows/*` and often use `HLogStore`/`ArtifactStore` to persist outputs.
  - Keep prompts' input/output schemas in sync with callers (UI forms, server actions).


Security & platform notes
------------------------
- CSP header: the app sets a Content-Security-Policy in `next.config.js`; keep changes minimal and document any external host additions.
- Secrets: never commit API keys or `.env.local`. Use GitHub Secrets for CI and an environment-aware secrets manager for deployed Lambdas (see `template.yaml` using Secrets Manager).
- PWA: `@ducanh2912/next-pwa` is configured in `next.config.js`. It is disabled during development via `process.env.NODE_ENV === "development"` – test service worker behavior in a production build locally.

CODEOWNERS & maintainers
------------------------
- Add a `CODEOWNERS` file under `.github/` to route reviews. Example (update to match actual maintainers):

```
# GitHub CODEOWNERS
* @emergenceofone
```

Further work
------------
- If you'd like, I can add the example CI workflow file and `CODEOWNERS` now, and run a quick local lint/build to verify formatting.

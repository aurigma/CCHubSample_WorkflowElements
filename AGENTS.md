# AGENTS.md

Guidance for Codex and other coding agents working in this repository.

## Project Overview

This is a Customer's Canvas Hub sample application built with:

- Node.js 20.17+.
- Express 4 backend written in TypeScript.
- React 18 frontend written in TypeScript.
- Vite 5 for frontend build/dev integration.
- `vite-express` to serve the React app from the Express server.
- SCSS, Bootstrap, and React Bootstrap for UI styling.

The app demonstrates Customer's Canvas editors integrations through Workflow Elements and UI Framework JS libraries. Additionally, you will find some examples of using Customer's Canvas Hub API for storefront authentication, editor embedding, design/template operations, and project saving.

## Repository Layout

- `src/server/` contains the Express backend, Customer's Canvas API wrappers, auth, configuration, middleware, and server entrypoint.
- `src/client/` contains the React app, dynamic code example routes, shared frontend API helpers, constants, interfaces, assets, and styles.
- `src/client/code-examples/` contains code example editor integrations. Prefer adding new code example experiences here.
- `src/client/components/` contains reusable React UI components.
- `src/client/shared/` contains frontend helpers and API service wrappers.
- `src/client/interfaces/` contains shared frontend TypeScript interfaces.
- `public/` contains static Vite assets.
- `code-examples.jsonc.sample` is the tracked template for local code example configuration.
- `code-examples.jsonc` is local, ignored configuration for enabled examples and their params.
- `dist/` is generated output. Do not edit it manually.
- `node_modules/` is installed dependencies. Do not edit it.

## Important Commands

- `npm install` installs dependencies.
- `npm run dev` starts the development workflow: watches the server TypeScript build and runs the compiled Express server.
- `npm run build` builds the server and frontend.
- `npm run build:server` compiles only the backend TypeScript.
- `npm start` runs the production server from `dist/server/main.js`.

There is no dedicated test script in `package.json` at the time of writing. For verification, run `npm run build` unless the requested change has a narrower safe check.

## Environment And Secrets

- `.env` contains local credentials and must not be committed or exposed in answers.
- Use `.env.sample` as the source of truth for expected configuration keys.
- `code-examples.jsonc` contains local example IDs and params and must not be committed or exposed in answers if it contains private identifiers.
- Use `code-examples.jsonc.sample` as the source of truth for expected code example configuration shape.
- Backend-only secrets must not be moved into frontend code.
- Only variables prefixed with `VITE_` are available to the frontend through `import.meta.env`.
- Customer's Canvas credentials such as `CCHUB_CLIENTID` and `CCHUB_CLIENTSECRET` belong on the server side only.
- Do not log tokens, client secrets, or full credential-bearing configuration objects.

## General Rules

- Keep changes small and focused; do not refactor unrelated code.
- Do not introduce new architectural patterns or dependencies without explicit approval.
- Respect layer boundaries and dependency direction.
- If unclear, prefer consistency with existing code and ask for clarification.

## TypeScript And Module Rules

- The project uses ESM (`"type": "module"`) and `moduleResolution: "NodeNext"`.
- Server-side relative TypeScript imports should use `.js` extensions so compiled Node ESM works correctly.
- Keep `strict` TypeScript compatibility.
- Prefer existing interfaces in `src/client/interfaces/` before adding new shape definitions.
- Avoid `any` unless it is already part of an Express error boundary or third-party API escape hatch.

## Backend Guidelines

- Express entrypoint: `src/server/main.ts`.
- Keep route handlers thin and small. Move all logic, file reading/writing, and API client usage to separate service classes/functions in separate file under `src/server/`.
- Wrap async route handlers with `asyncHandler`.
- Add `logEndpoint(logger)` to new API routes unless there is a specific reason not to.
- Return JSON responses with stable shapes and update matching frontend interfaces.
- Preserve the current startup behavior where the server obtains a Customer's Canvas access token before listening.
- When adding configuration, read it through `CCHubConfiguration` rather than scattering `process.env` reads across services.
- Code example configuration is read from `code-examples.jsonc` through `CodeExampleConfigurationService`.

## Frontend Guidelines

- React entrypoint: `src/client/main.tsx`.
- App routes are registered in `src/client/App.tsx`.
- Code example navigation is driven by `GET /api/code-examples`.
- If adding a new code example page, add the React component under `src/client/code-examples/`, update the registry in `App.tsx`, and update `code-examples.jsonc.sample`.
- Keep server communication in `src/client/shared/server-api-service.ts` or a similarly focused helper.
- Use existing SCSS/component conventions before introducing a new styling pattern.
- Do not expose backend secrets or server-only Customer's Canvas API calls in browser code.

## Customer's Canvas Integration Notes

- Keep storefront/user-token acquisition on the backend.
- Treat `userId`, `privateDesignId`, `publicDesignId`, `mockupIds`, `orderId`, and product/reference IDs as integration identifiers; validate or guard them where user input is accepted.
- Prefer small, readable code example code over over-abstracted production frameworks. This repository is a sample app, so clarity matters.
- When changing code example behavior, keep the README.md, AGENTS.md, `.env.sample`, and `code-examples.jsonc.sample` aligned if new configuration is required.

## Generated Files And Dependencies

- Do not manually edit `dist/`, `node_modules/`, lockfile internals, or generated artifacts.
- Do not run dependency updates unless the task explicitly requires it.
- If dependencies must change, update `package.json` and `package-lock.json` together using npm.

## Verification Checklist

Before finishing a code change:

1. Run `npm run build` when feasible.
2. If only backend code changed, `npm run build:server` is an acceptable narrower check.
3. For UI changes, start `npm run dev` when practical and verify the affected route in the browser.
4. Note any verification that could not be run and why.
5. If any archtectural chances was made, ensure that it is reflected in AGENTS.md.

## Coding Style

- Follow the existing formatting style in nearby files.
- Keep comments useful and sparse.
- Prefer clear names over clever abstractions.
- Keep changes scoped to the requested behavior.
- Do not rewrite unrelated files or refactor broadly unless the task asks for it.

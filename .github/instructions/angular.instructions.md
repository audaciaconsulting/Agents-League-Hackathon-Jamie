---
description: 'Angular frontend development standards for the client application'
applyTo: 'client/src/**/*.{ts,html,css}, client/angular.json, client/package.json, client/proxy.conf.json, client/tsconfig*.json'
---

# Angular Frontend Development Instructions

You are working in an Angular client application. Follow the existing project
structure and keep changes consistent with the current codebase.

## TypeScript and Angular Patterns

- Prefer standalone components, modern Angular APIs, and strict TypeScript.
- Use explicit types for component inputs, outputs, services, and observable
  streams.
- Prefer `inject()` in constructors-free code where it matches the existing
  style.
- Use `async`/`await` for promise-based work and keep reactive flows typed.
- Avoid `any`; use `unknown` when input must be narrowed.

## Components and Templates

- Keep components small and focused.
- Put business logic in TypeScript, not templates.
- Use semantic HTML and accessible labels, roles, and keyboard interactions.
- Prefer `@if`, `@for`, and `@defer` where they improve readability and
  performance.
- Always use `track` expressions for repeaters when identity is stable.
- Do not bind unsanitized HTML into templates.

## Styling

- Keep styles scoped to the component when possible.
- Use CSS custom properties for shared theme values.
- Prefer layout and spacing that matches the existing visual system.
- Avoid introducing new global styles unless they are required by the app shell.

## Performance and Security

- Prefer lazy loading for routes and deferred loading for expensive views.
- Use `NgOptimizedImage` for images when appropriate.
- Keep change detection and rendering work minimal.
- Sanitize external HTML before rendering it.
- Be careful with browser storage, query strings, and user-provided content.

## Testing

- Add or update focused tests when changing Angular behavior.
- Keep test files alongside the code they verify.
- Prefer small, deterministic tests that match the current test setup.

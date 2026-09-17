# F1 Circuit Client

Frontend repository for the F1 Circuit historical and post-race application, using the selected Apex design direction.

This initial commit establishes the directory structure only. No application features, dependencies, generated output or deployment configuration have been added. The development branch is `main`.

## Planned architecture

React with plain JavaScript, Redux Toolkit and RTK Query. The client will consume the normalized F1 Circuit API; provider credentials and database access belong on the server. The Apex design system will provide reusable tokens, components and patterns.

| Directory | Responsibility |
|---|---|
| `src/app` | Application setup, store and shared state slices |
| `src/components` | Reusable application components |
| `src/features` | Feature modules |
| `src/pages` | Route-level views |
| `src/api` | API query definitions and response adapters |
| `src/design-system` | Apex tokens, primitives, components, patterns, assets and documentation |
| `src/styles` | Application-level styles |
| `public` | Public static assets; never secrets |
| `config` | Reviewed tooling configuration when implementation begins |
| `tests`, `fixtures` | Tests and clearly labelled synthetic examples |
| `contracts` | Pinned API contract artifacts and version manifests |
| `docs` | Frontend documentation |

Empty directories are retained using `.gitkeep` placeholders. No TypeScript is introduced.

The API is a separate repository. This client must build independently and must not depend on untracked sibling files or a parent npm workspace. Keep credentials and local environment files out of Git. Client configuration is public once bundled; never put secrets in it.

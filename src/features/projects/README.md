Business logic for the Project domain (data hooks, mutations, mappers) — presentation lives in components/project.

`repository.ts` is the reference implementation of the shared `src/lib/repository.ts` data-access pattern for this domain — see that file's comment before adding a repository for another feature. It's an `InMemoryRepository`, empty by default, until a real database is chosen.

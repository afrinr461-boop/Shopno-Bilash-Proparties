import type { ID } from "@/types/common";

/**
 * The data-access abstraction `src/features/*` and `src/services/` were
 * left empty for (their READMEs say "not implemented yet" — see
 * ARCHITECTURE.md §9/§19). No database exists yet, so this can't be a real
 * repository — but the *shape* every future feature module should code
 * against can be fixed now, so that swapping `InMemoryRepository` for a
 * real Postgres/Prisma-backed implementation later is a one-line change
 * at each feature's repository file, never a change to the API routes or
 * UI that call it.
 *
 * Deliberately generic and tiny: five methods, no query language, no
 * pagination/filtering API. Real query needs (e.g. "units in this
 * project", "leads assigned to this user") belong as extra methods on a
 * specific feature's own repository interface (which can extend this one),
 * not bolted onto this shared base.
 */
export interface Repository<T extends { id: ID }> {
  list(): Promise<T[]>;
  findById(id: ID): Promise<T | null>;
  create(entity: T): Promise<T>;
  update(id: ID, patch: Partial<T>): Promise<T | null>;
  remove(id: ID): Promise<boolean>;
}

/**
 * In-memory implementation for development and for exercising the API
 * route → repository flow before a real database is chosen. Never seeded
 * with fake business data by this class itself — callers pass whatever
 * (usually empty) initial array they want, same "start empty, never
 * invent records" rule the rest of the codebase follows.
 */
export class InMemoryRepository<T extends { id: ID }> implements Repository<T> {
  private items: T[];

  constructor(initial: T[] = []) {
    this.items = [...initial];
  }

  async list(): Promise<T[]> {
    return [...this.items];
  }

  async findById(id: ID): Promise<T | null> {
    return this.items.find((item) => item.id === id) ?? null;
  }

  async create(entity: T): Promise<T> {
    this.items.push(entity);
    return entity;
  }

  async update(id: ID, patch: Partial<T>): Promise<T | null> {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) return null;
    this.items[index] = { ...this.items[index], ...patch };
    return this.items[index];
  }

  async remove(id: ID): Promise<boolean> {
    const index = this.items.findIndex((item) => item.id === id);
    if (index === -1) return false;
    this.items.splice(index, 1);
    return true;
  }
}

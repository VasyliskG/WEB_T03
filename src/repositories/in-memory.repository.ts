import type { BaseEntity, IRepository, UpdateDto } from "../types/index.js";

export class InMemoryRepository<T extends BaseEntity> implements IRepository<T> {
  protected items = new Map<string, T>();

  create(item: T): T {
    if (this.items.has(item.id)) {
      throw new Error(`Сутність з id "${item.id}" вже існує`);
    }
    this.items.set(item.id, item);
    return item;
  }

  findById(id: string): T | null {
    return this.items.get(id) ?? null;
  }

  findAll(): T[] {
    return [...this.items.values()];
  }

  update(id: string, patch: UpdateDto<T>): T | null {
    const existing = this.items.get(id);
    if (!existing) {
      return null;
    }

    // Захист у runtime: системні поля з patch ігноруються, навіть якщо їх передали в обхід типів
    const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...changes } =
      patch as UpdateDto<T> & Partial<BaseEntity>;

    // Мутуємо наявний об'єкт, щоб зберегти прототип класу сутності
    Object.assign(existing, changes, { updatedAt: new Date() });
    return existing;
  }

  deleteById(id: string): boolean {
    return this.items.delete(id);
  }
}

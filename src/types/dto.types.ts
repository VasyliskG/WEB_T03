import type { BaseEntity } from "./base-entity.js";
import type { EntityStatus } from "./entity-status.enum.js";

// Системні поля, якими керує репозиторій, а не клієнт
type SystemFields = keyof BaseEntity;

// DTO створення: сутність без id, createdAt, updatedAt
export type CreateDto<T extends BaseEntity> = Omit<T, SystemFields>;

// DTO часткового оновлення (PATCH): будь-яка підмножина змінюваних полів
export type UpdateDto<T extends BaseEntity> = Partial<CreateDto<T>>;

// Легковагий витяг сутності для списків
export type EntitySummary<T extends BaseEntity & { title: string; price: number }> = Pick<
  T,
  "id" | "title" | "price"
>;

// Лічильник кількості сутностей за статусами
export type EntityAnalytics<T extends BaseEntity & { status: EntityStatus }> = Record<
  T["status"],
  number
>;

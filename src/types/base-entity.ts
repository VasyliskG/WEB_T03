// Базовий контракт кожної сутності: первинний ключ + системні мітки часу
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

import type { BaseEntity } from "./base-entity.js";
import type { EntityStatus } from "./entity-status.enum.js";

// Іменований кортеж характеристик гаджета (варіант 1)
export type GadgetSpecs = [cpu: string, ramGb: number];

export interface Gadget extends BaseEntity {
  title: string;
  price: number;
  warrantyMonths: number;
  specs: GadgetSpecs;
  status: EntityStatus;
}

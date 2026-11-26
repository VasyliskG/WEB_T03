import { randomUUID } from "node:crypto";
import { FrozenEntity } from "../decorators/index.js";
import type { CreateDto, EntityStatus, Gadget, GadgetSpecs } from "../types/index.js";

@FrozenEntity()
export class GadgetEntity implements Gadget {
  readonly id: string;
  readonly createdAt: Date;
  updatedAt: Date;
  title: string;
  price: number;
  warrantyMonths: number;
  specs: GadgetSpecs;
  status: EntityStatus;

  constructor(dto: CreateDto<Gadget>) {
    const now = new Date();
    this.id = randomUUID();
    this.createdAt = now;
    this.updatedAt = now;
    this.title = dto.title;
    this.price = dto.price;
    this.warrantyMonths = dto.warrantyMonths;
    this.specs = dto.specs;
    this.status = dto.status;
  }
}

import { LogExecutionTime } from "../decorators/index.js";
import { GadgetEntity } from "../entities/index.js";
import type { IRepository } from "../types/index.js";
import {
  EntityStatus,
  type CreateDto,
  type EntityAnalytics,
  type EntitySummary,
  type Gadget,
  type UpdateDto,
} from "../types/index.js";

export class GadgetService {
  constructor(private readonly repository: IRepository<GadgetEntity>) {}

  @LogExecutionTime()
  create(dto: CreateDto<Gadget>): GadgetEntity {
    return this.repository.create(new GadgetEntity(dto));
  }

  @LogExecutionTime()
  update(id: string, patch: UpdateDto<Gadget>): GadgetEntity | null {
    return this.repository.update(id, patch);
  }

  @LogExecutionTime()
  findAll(): GadgetEntity[] {
    return this.repository.findAll();
  }

  findById(id: string): GadgetEntity | null {
    return this.repository.findById(id);
  }

  getSummaries(): EntitySummary<Gadget>[] {
    return this.repository.findAll().map(({ id, title, price }) => ({ id, title, price }));
  }

  getStatusAnalytics(): EntityAnalytics<Gadget> {
    // Ініціалізуємо всі ключі нулями, щоб Record був повним
    const analytics: EntityAnalytics<Gadget> = {
      [EntityStatus.Active]: 0,
      [EntityStatus.Archived]: 0,
      [EntityStatus.Draft]: 0,
    };
    for (const gadget of this.repository.findAll()) {
      analytics[gadget.status] += 1;
    }
    return analytics;
  }
}

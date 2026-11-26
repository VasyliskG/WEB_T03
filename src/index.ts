import { InMemoryRepository } from "./repositories/index.js";
import { GadgetService } from "./services/index.js";
import type { GadgetEntity } from "./entities/index.js";
import { EntityStatus, type ApiResponse, type CreateDto, type Gadget } from "./types/index.js";

const toJson = (value: unknown): string => JSON.stringify(value, null, 2);

console.log("=== ІНІЦІАЛІЗАЦІЯ GENERIC SERVICE LAYER ===\n");

const service = new GadgetService(new InMemoryRepository<GadgetEntity>());

const dtos: CreateDto<Gadget>[] = [
  {
    title: "Ноутбук ProBook 14",
    price: 32999,
    warrantyMonths: 24,
    specs: ["Intel Core i7-1360P", 16],
    status: EntityStatus.Active,
  },
  {
    title: "Смартфон Pixel Neo",
    price: 18999,
    warrantyMonths: 12,
    specs: ["Tensor G3", 8],
    status: EntityStatus.Active,
  },
  {
    title: "Планшет TabLite 10",
    price: 7999,
    warrantyMonths: 12,
    specs: ["MediaTek Helio G99", 4],
    status: EntityStatus.Archived,
  },
];

const created = dtos.map((dto) => {
  const gadget = service.create(dto);
  console.log(
    `- Створено сутність ID: ${gadget.id} | Статус: ${gadget.status} | Назва: ${gadget.title}\n`,
  );
  return gadget;
});

const target = created[1];
if (!target) {
  throw new Error("Не вдалося створити сутності для демонстрації");
}

// Часткове оновлення через UpdateDto: змінюємо лише ціну
const updated = service.update(target.id, { price: 14999 });
if (!updated) {
  throw new Error(`Сутність ${target.id} не знайдено`);
}
console.log(`- Оновлено сутність ID: ${updated.id} | Актуалізовано ціну та updatedAt.\n`);

const all = service.findAll();
console.log(`Отримано сутностей у репозиторії: ${all.length}\n`);

console.log("=== КОРОТКИЙ ВИТЯГ (PICK) ===");
console.log(toJson(service.getSummaries()));

console.log("\n=== СТАТИСТИКА СТАТУСІВ (RECORD) ===");
console.log(toJson(service.getStatusAnalytics()));

const response: ApiResponse<GadgetEntity> = {
  success: true,
  timestamp: new Date(),
  data: updated,
  meta: {
    totalCount: all.length,
    version: "1.0.0",
  },
};

console.log("\n=== СТАНДАРТИЗОВАНА ВІДПОВІДЬ API (GENERIC API RESPONSE) ===");
console.log(toJson(response));

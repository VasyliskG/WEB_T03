# Практична робота № 3

## Тема: Узагальнення, декоратори та утиліти типів TypeScript

---

## Мета роботи

- Опанувати розширені засоби мови TypeScript, критично необхідні для промислової розробки на NestJS: узагальнення (`generics`), утилітарні типи (`utility types`) та метапрограмування на основі декораторів (`decorators`).
- Навчитися проєктувати типізовані архітектурні патерни, зокрема патерн репозиторію (`Generic Repository Pattern`) та універсальні обгортки API-відповідей (`ApiResponse<T>`).
- Опанувати трансформацію типів для створення об'єктів передачі даних (DTO) за допомогою `Partial<T>`, `Required<T>`, `Pick<T, K>`, `Omit<T, K>` та `Record<K, V>`.
- Навчитися створювати власні декоратори класів та методів з використанням дескрипторів властивостей (`PropertyDescriptor`), налаштувати компілятор для підтримки метаданих та організувати чисту модульну структуру за допомогою `barrel files`.

---

## Технічне забезпечення

- Операційна система: Windows, macOS або Linux.
- Середовище розробки: Visual Studio Code (із розширенням TypeScript and JavaScript Language Features).
- Платформа виконання: Node.js версії 18+ (LTS) та пакетний менеджер npm.
- Інструменти компіляції та виконання: TypeScript (`tsc`) та швидкий запускач `tsx`.
- Термінал / CLI: bash, zsh або PowerShell.
- Система контролю версій: Git.

---

## Короткі теоретичні відомості

### 1. Узагальнення (Generics) та обмеження типів (Type Constraints)

Дженерики (`generics`) дозволяють створювати функції, інтерфейси та класи, які здатні працювати з різноманітними типами даних, зберігаючи повну статичну типізацію на етапі компіляції замість знеособленого використання `any`.

Для обмеження множини допустимих типів використовується ключове слово `extends` (**generic constraint**):

```typescript
// Базовий контракт з обов'язковим первинним ключем
interface Identifiable {
  id: string;
}

// Універсальний контейнер результату операції
interface OperationResult<TData, TMeta = Record<string, unknown>> {
  success: boolean;
  data: TData;
  meta?: TMeta;
  executedAt: Date;
}

// Generic-функція з обмеженням типу (Type Constraint)
function findEntityById<T extends Identifiable>(items: T[], targetId: string): T | undefined {
  return items.find((item) => item.id === targetId);
}
```

У цьому прикладі параметр типу `T` гарантовано має поле `id`, що дозволяє безпечно звертатися до нього всередині функції.

---

### 2. Утилітарні типи (Utility Types)

TypeScript надає набір вбудованих утиліт для маніпуляції та трансформації існуючих типів:

- `Partial<T>` — робить усі властивості типу `T` опціональними (`?`). Використовується для PATCH-запитів та часткових оновлень.
- `Required<T>` — робить усі властивості типу `T` обов'язковими.
- `Readonly<T>` — встановлює модифікатор `readonly` для всіх властивостей, блокуючи їхню мутацію.
- `Pick<T, K>` — конструює новий тип, вибираючи лише вказаний набір ключів `K` із типу `T`.
- `Omit<T, K>` — конструює новий тип, видаляючи вказаний набір ключів `K` із типу `T`. Ідеально для генерації DTO створення сутності без системних полів (`id`, `createdAt`).
- `Record<K, V>` — будує тип об'єкта, де ключі належать до типу `K`, а значення — до типу `V`. Застосовується для словників, словників кешу та мапінгів.

```typescript
interface AuditLogEntry {
  id: string;
  eventType: string;
  payload: string;
  severity: "low" | "medium" | "high";
  createdAt: Date;
}

// 1. DTO створення події (виключаємо системні поля id та createdAt)
type CreateAuditLogDto = Omit<AuditLogEntry, "id" | "createdAt">;

// 2. DTO оновлення події (усі поля стають опціональними)
type UpdateAuditLogDto = Partial<CreateAuditLogDto>;

// 3. Легковажна прев'ю-модель (вибираємо тільки id та eventType)
type AuditLogPreview = Pick<AuditLogEntry, "id" | "eventType">;

// 4. Словник лічильників за рівнями важливості (Record)
type SeverityCounters = Record<AuditLogEntry["severity"], number>;
```

---

### 3. Метапрограмування: декоратори класів та методів

Декоратори (`decorators`) — це спеціальні функції, що надають можливість додавати анотації, модифікувати та перехоплювати поведінку класів, методів, властивостей або параметрів. У фреймворку NestJS вся архітектура побудована навколо декораторів (`@Controller()`, `@Injectable()`, `@Get()`).

Для використання класичних декораторів у `tsconfig.json` необхідно активувати прапорці:
```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

#### Декоратор методу (Method Decorator)
Декоратор методу приймає три аргументи:
1. `target` — прототип класу для екземплярного методу або функція-конструктор для статичного;
2. `propertyKey` — назва методу (`string | symbol`);
3. `descriptor` — об'єкт опису властивості (`PropertyDescriptor`), у якому властивість `value` містить оригінальну функцію.

```typescript
// Фабрика декоратора для заміру часу виконання методу
function MeasureTime() {
  return function (
    target: object,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ): PropertyDescriptor {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: unknown[]) {
      const start = performance.now();
      const result = originalMethod.apply(this, args);
      const duration = (performance.now() - start).toFixed(2);
      console.log(`[PERF] Метод ${propertyKey} виконано за ${duration} ms`);
      return result;
    };

    return descriptor;
  };
}
```

#### Декоратор класу (Class Decorator)
Декоратор класу приймає функцію-конструктор і дозволяє змінювати або «заморожувати» поведінку екземплярів:

```typescript
function ImmutableClass<T extends new (...args: unknown[]) => object>(constructor: T) {
  Object.freeze(constructor);
  Object.freeze(constructor.prototype);
}
```

---

### 4. Організація модулів та Barrel Files

Патерн **Barrel file** являє собою файл `index.ts` всередині каталогу, який реекспортує публічні типи, класи та утиліти. Це спрощує імпорти для клієнтського коду, приховуючи внутрішню структуру модуля:

```typescript
// src/repositories/index.ts
export * from "./base.repository";
export * from "./user.repository";

// Використання в іншому файлі
import { UserRepository } from "./repositories";
```

---

## Постановка задачі

В інженерній практиці розробки серверних вебзастосунків пряме маніпулювання даними безпосередньо в обробниках запитів призводить до спагеті-коду. Патерн **Generic Repository** дозволяє інкапсулювати операції доступу до колекцій даних за єдиним інтерфейсом, незалежно від конкретної сутності.

У межах практичної роботи необхідно розробити модуль **універсального сервісного шару та репозиторію в оперативній пам'яті (In-Memory Generic Repository & Service Layer)**. 

Студент реалізує типізовану систему управління сутностями відповідно до свого **варіанта з Практичної роботи № 2**:

<<<

### Таблиця варіантів сутностей предметної області

| Варіант | Категорія магазину | Модельована сутність | Ключові поля для операцій |
|:---:|---|---|---|
| **1** | Електроніка та гаджети | `GadgetEntity` | `title`, `price`, `warrantyMonths`, `specs: [cpu: string, ramGb: number]` |
| **2** | Книжковий онлайн-магазин | `BookEntity` | `title`, `price`, `isbn`, `pageCount`, `author` |
| **3** | Одяг та взуття | `ClothingEntity` | `title`, `price`, `size`, `material`, `color` |
| **4** | Доставка їжі та ресторанів | `FoodEntity` | `title`, `price`, `weightGrams`, `calories`, `allergens: string[]` |
| **5** | Онлайн-аптека | `MedicineEntity` | `title`, `price`, `dosageMg`, `isPrescriptionRequired`, `expirationDate` |
| **6** | Будівельні матеріали | `ConstructionEntity` | `title`, `price`, `unitOfMeasure`, `weightPerUnitKg`, `isHeavyCargo` |
| **7** | Автозапчастини | `AutoPartEntity` | `title`, `price`, `vinCompatibility: string[]`, `oemCode`, `condition` |
| **8** | Квитки на події | `TicketEntity` | `title`, `price`, `venue`, `seat: [sector: number, row: number, seat: number]` |
| **9** | Онлайн-курси та підписки | `CourseEntity` | `title`, `price`, `durationHours`, `difficultyLevel` |
| **10** | Зоотовари | `PetSupplyEntity` | `title`, `price`, `petCategory`, `packageWeightKg` |

> Якщо номер у журналі перевищує 10, варіант обчислюється за формулою: `((номер - 1) % 10) + 1`.

---

## Завдання

Практична робота складається з трьох послідовних рівнів. Кожен наступний рівень базується на попередньому та розширює функціональність розроблюваного рішення.

---

### Рівень 1. Базовий: generic-інтерфейси та Generic In-Memory Repository

1. **Ініціалізація структури проєкту:**
   - Створити каталог проєкту, ініціалізувати `package.json`.
   - Встановити залежності розробки (`devDependencies`): `typescript`, `tsx`, `@types/node`.
   - Налаштувати `tsconfig.json` із суворим режимом (`strict: true`, `noImplicitAny: true`) та обов'язково увімкнути прапорці метапрограмування:
     ```json
     "experimentalDecorators": true,
     "emitDecoratorMetadata": true
     ```
   - Організувати структуру папок:
     ```text
     src/
       ├── types/
       ├── repositories/
       ├── decorators/
       └── index.ts
     ```

2. **Проєктування базових generic-типів:**
   - Оголосити інтерфейс `BaseEntity`:
     - `id: string`;
     - `createdAt: Date`;
     - `updatedAt: Date`.
   - Оголосити універсальний generic-інтерфейс стандартизованої відповіді `ApiResponse<TData>`:
     - `success: boolean`;
     - `data: TData`;
     - `timestamp: Date`;
     - `meta?: Record<string, unknown>`.
   - Оголосити контракт інтерфейсу репозиторію `IRepository<T extends BaseEntity>` з операціями:
     - `create(item: T): T`;
     - `findById(id: string): T | null`;
     - `findAll(): T[]`;
     - `deleteById(id: string): boolean`.

3. **Реалізація Generic In-Memory Repository:**
   - Створити клас `InMemoryRepository<T extends BaseEntity>`, що імплементує `IRepository<T>`.
   - Для внутрішнього зберігання використати масив `protected items: T[] = []` або мапу `Map<string, T>`.
   - Реалізувати всі контрактні методи пошуку, додавання та видалення сутності.

---

### Рівень 2: трансформація типів (Utility Types) та DTO

1. **Визначення статусів та ролей через перерахування (`enum`):**
   - Оголосити строковий `enum EntityStatus`:
     - `Active = "ACTIVE"`;
     - `Archived = "ARCHIVED"`;
     - `Draft = "DRAFT"`.
   - Додати до моделі своєї сутності поле `status: EntityStatus`.

2. **Генерація типів DTO за допомогою Utility Types:**
   - Створити тип `CreateDto<T>`: за допомогою `Omit` виключити з сутності системні поля `id`, `createdAt`, `updatedAt`.
   - Створити тип `UpdateDto<T>`: за допомогою комбінації `Partial<CreateDto<T>>` дозволити передавати будь-яку підмножину змінюваних полів сутності.
   - Створити тип `EntitySummary<T>`: за допомогою `Pick` сформувати легковантажний витяг сутності, що містить виключно поля `id`, `title` та `price`.
   - Створити словник аналітики `EntityAnalytics<T>`: за допомогою `Record<EntityStatus, number>` типізувати об'єкт-лічильник кількості сутностей за їхніми статусами.

3. **Розширення репозиторію операціями оновлення:**
   - Додати в інтерфейс `IRepository<T>` та реалізувати в `InMemoryRepository<T>` метод:
     `update(id: string, patch: UpdateDto<T>): T | null`.
   - При оновленні гарантувати актуалізацію поля `updatedAt: new Date()` та збереження незмінності первинного ключа `id`.

---

### Рівень 3. Просунутий: метапрограмування та архітектурна модульність

1. **Розробка декоратора методу `@LogExecutionTime()`:**
   - Написати фабрику декоратора методу `@LogExecutionTime()`, яка:
     - Перехоплює виклик цільового методу через `PropertyDescriptor`;
     - Фіксує час старту через `performance.now()`;
     - Викликає оригінальний метод;
     - Розраховує витрачений час і виводить у консоль інформаційне повідомлення:
       `[BENCHMARK] Метод <MethodName> виконано за <Time> ms.`;
     - Повертає результат виконання.

2. **Розробка декоратора класу `@FrozenEntity()`:**
   - Написати декоратор класу `@FrozenEntity()`, який викликає `Object.freeze()` на конструкторі класу та його прототипі, унеможливлюючи динамічне розширення методів під час виконання (runtime tamper protection).

3. **Створення предметного сервісу з декораторами:**
   - Оголосити клас сутності свого варіанта, застосувавши декоратор класу `@FrozenEntity()`.
   - Створити предметний репозиторій або сервіс, методи якого (`create`, `update`, `findAll`) позначені декоратором `@LogExecutionTime()`.

4. **Архітектура Barrel Files та інтеграційна демонстрація (`src/index.ts`):**
   - Створити `index.ts` у кожному підкаталозі (`src/types/index.ts`, `src/repositories/index.ts`, `src/decorators/index.ts`) для централізованого реекспорту компонентів.
   - У кореневій точці входу `src/index.ts`:
     - Створити екземпляр репозиторію для сутності за варіантом;
     - Виконати створення кількох сутностей через DTO;
     - Провести часткове оновлення через `UpdateDto`;
     - Здійснити підрахунок статистики статусів за допомогою `Record<EntityStatus, number>`;
     - Огорнути вихідні дані в `ApiResponse<T>` та вивести відформатований результат у консоль.

---

## Приклад очікуваного виведення програми

```text
=== ІНІЦІАЛІЗАЦІЯ GENERIC SERVICE LAYER ===

[BENCHMARK] Метод create виконано за 0.12 ms.
- Створено сутність ID: 8f3c-1a2b | Статус: ACTIVE | Назва: [Товар за варіантом]

[BENCHMARK] Метод update виконано за 0.08 ms.
- Оновлено сутність ID: 8f3c-1a2b | Актуалізовано ціну та updatedAt.

[BENCHMARK] Метод findAll виконано за 0.05 ms.
Отримано сутностей у репозиторії: 3

=== СТАТИСТИКА СТАТУСІВ (RECORD) ===
{
  "ACTIVE": 2,
  "ARCHIVED": 1,
  "DRAFT": 0
}

=== СТАНДАРТИЗОВАНА ВІДПОВІДЬ API (GENERIC API RESPONSE) ===
{
  "success": true,
  "timestamp": "2026-09-09T19:45:00.000Z",
  "data": {
    "id": "8f3c-1a2b",
    "title": "Товар за варіантом",
    "price": 14999,
    "status": "ACTIVE",
    "createdAt": "2026-09-09T19:44:59.000Z",
    "updatedAt": "2026-09-09T19:45:00.000Z"
  },
  "meta": {
    "totalCount": 3,
    "version": "1.0.0"
  }
}
```

---

## Контрольні питання

1. Що таке параметри типу (`generics`) у TypeScript? Яку проблему вони вирішують порівняно з використанням типу `any` або `unknown`?
2. Як працює обмеження узагальнень (`type constraints`) за допомогою ключового слова `extends`? Наведіть приклад.
3. У чому полягає різниця між утилітарними типами `Omit<T, K>` та `Pick<T, K>`? У яких практичних сценаріях застосовується кожен із них?
4. Для чого призначений утилітарний тип `Partial<T>`? Чому він є фундаментальним під час створення DTO для операцій оновлення (`PATCH`)?
5. Як працює утиліта `Record<K, V>`? Які типи даних дозволено передавати як перший аргумент `K`?
6. Що таке декоратор у TypeScript? Які обов'язкові параметри конфігурації у файлі `tsconfig.json` необхідні для підтримки експериментальних декораторів?
7. Що являє собою об'єкт `PropertyDescriptor` у декораторі методу? Як за допомогою властивості `descriptor.value` перехопити та підмінити виконання оригінального методу?
8. Що таке архітектурний патерн `Barrel File`? Які переваги він надає під час масштабування кодової бази бекенд-застосунку?

---

## Критерії оцінювання

Оцінювання здійснюється за шкалою повноти реалізації рівнів практичної роботи:

- **«Задовільно» (Рівень 1):** реалізовано базовий прототип, створено структуру проєкту, програма успішно компілюється та виконує базові сценарії.
- **«Добре» (Рівень 2):** виконано базовий рівень та реалізовано ключову функціональність заняття, забезпечено надійність і безпеку виконання коду.
- **«Відмінно» (Рівень 3):** повністю завершено всі три рівні завдання з дотриманням кращих інженерних практик, чистоти архітектури та оптимізації.
- **Усний захист:** обов'язкове пояснення логіки коду та впевнені відповіді на контрольні питання викладача.

## Вимоги до звітності

1. Опублікувати вихідний код у Git-репозиторії.
2. Оформити файл `README.md` з описом проєкту, інструкцією запуску та обов'язковими скриншотами роботи програми (включаючи демонстрацію відсутності помилок).
3. Продемонструвати роботу програми викладачеві та захистити результати.

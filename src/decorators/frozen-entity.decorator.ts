// Конструктор будь-якого класу. any[] потрібен, бо unknown[] несумісний з типізованими параметрами конструктора
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor = new (...args: any[]) => object;

// Декоратор класу: забороняє змінювати статичні члени та методи прототипу в runtime
export function FrozenEntity() {
  return function <T extends Constructor>(constructor: T): T {
    Object.freeze(constructor);
    Object.freeze(constructor.prototype);
    return constructor;
  };
}

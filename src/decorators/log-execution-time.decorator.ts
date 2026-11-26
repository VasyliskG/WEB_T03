import { performance } from "node:perf_hooks";

// Фабрика декоратора методу: вимірює час виконання і логує його
export function LogExecutionTime() {
  return function (
    _target: object,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor {
    const originalMethod = descriptor.value as (...args: unknown[]) => unknown;

    descriptor.value = function (this: unknown, ...args: unknown[]) {
      const start = performance.now();
      const result = originalMethod.apply(this, args);
      const duration = (performance.now() - start).toFixed(2);
      console.log(`[BENCHMARK] Метод ${String(propertyKey)} виконано за ${duration} ms.`);
      return result;
    };

    return descriptor;
  };
}

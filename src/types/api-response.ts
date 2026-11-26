// Стандартизована обгортка відповіді API для будь-якого типу даних
export interface ApiResponse<TData> {
  success: boolean;
  data: TData;
  timestamp: Date;
  meta?: Record<string, unknown>;
}

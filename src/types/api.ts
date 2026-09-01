export type FieldError = {
  field: string;
  message: string;
};

export type ApiErrorPayload = {
  code: string;
  message: string;
  details?: FieldError[];
};

export type ApiErrorBody = {
  error: ApiErrorPayload;
};

export type ApiEnvelope<T, M = undefined> = {
  data: T;
  meta?: M;
};

export type ListMeta = {
  page: number;
  pageSize: number;
  total: number;
};

export type CollectionMeta = {
  total: number;
};

export const ErrorCode = {
  Validation: 'VALIDATION_ERROR',
  NotFound: 'NOT_FOUND',
  SlotUnavailable: 'SLOT_UNAVAILABLE',
  ServiceUnavailable: 'SERVICE_UNAVAILABLE',
  Internal: 'INTERNAL_ERROR',
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

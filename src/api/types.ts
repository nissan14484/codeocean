export type Person = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  catchPhrase: string;
  comments: string;
};

export type ApiError = {
  status?: number;
  message: string;
  code?: string;
  data?: unknown;
};

export type ApiResult<T> =
  | {
      data: T;
      error: null;
    }
  | {
      data: null;
      error: ApiError;
    };

export function ok<T>(data: T): ApiResult<T> {
  return { data, error: null };
}

export function fail<T>(error: ApiError): ApiResult<T> {
  return { data: null, error };
}

export type ListParams = {
    q?: string;
    _limit?: number;
    _start?: number;
};

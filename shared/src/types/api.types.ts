export type ApiError = {
  readonly error: string;
  readonly fieldErrors?: Readonly<Record<string, readonly string[]>>;
};

export type ApiResult<T> =
  | { readonly ok: true; readonly data: T }
  | { readonly ok: false; readonly error: ApiError };

export class AppError extends Error {
  readonly status: number;
  readonly fieldErrors?: Readonly<Record<string, readonly string[]>>;

  constructor(status: number, message: string, fieldErrors?: Record<string, readonly string[]>) {
    super(message);
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

export const unauthorized = (message = 'Não autenticado'): AppError => new AppError(401, message);

export const forbidden = (message = 'Acesso negado'): AppError => new AppError(403, message);

export const notFound = (message = 'Não encontrado'): AppError => new AppError(404, message);

export const conflict = (message: string): AppError => new AppError(409, message);

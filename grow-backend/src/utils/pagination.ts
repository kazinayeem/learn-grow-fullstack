export type PaginationOptions = {
  defaultPage?: number;
  defaultLimit?: number;
  maxLimit?: number;
};

export type PaginationResult = {
  page: number;
  limit: number;
  skip: number;
};

const toPositiveInt = (value: unknown): number | null => {
  if (value === null || value === undefined) return null;
  const parsed = Number.parseInt(String(value), 10);
  if (!Number.isFinite(parsed) || Number.isNaN(parsed)) return null;
  if (parsed <= 0) return null;
  return parsed;
};

export const parsePagination = (
  params: any,
  options: PaginationOptions = {}
): PaginationResult => {
  const defaultPage = options.defaultPage ?? 1;
  const defaultLimit = options.defaultLimit ?? 10;
  const maxLimit = options.maxLimit ?? 10;

  const page = toPositiveInt(params?.page) ?? defaultPage;
  const requestedLimit = toPositiveInt(params?.limit) ?? defaultLimit;
  const limit = Math.max(1, Math.min(maxLimit, requestedLimit));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

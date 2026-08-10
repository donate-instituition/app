export type PaginationParams = {
  limit?: number;
  page?: number;
  search?: string;
  sort?: string;
};

export type PaginatedResponse<TItem> = {
  items: TItem[];
  meta: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    limit: number;
    page: number;
    total: number;
    totalPages: number;
  };
};

export function paginationQuery(params: PaginationParams = {}) {
  return {
    limit: params.limit ?? 50,
    page: params.page ?? 1,
    paginated: true,
    search: params.search,
    sort: params.sort,
  };
}

export function unwrapPaginated<TItem>(
  response: PaginatedResponse<TItem> | TItem[],
) {
  return Array.isArray(response) ? response : response.items;
}

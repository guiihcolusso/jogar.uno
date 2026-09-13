import { parseAsInteger } from 'nuqs'

export const PaginateQueryState = {
  page: parseAsInteger.withDefault(1).withOptions({ clearOnDefault: true }),
  perPage: parseAsInteger.withDefault(10).withOptions({ clearOnDefault: true }),
}

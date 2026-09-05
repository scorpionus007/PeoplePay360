'use strict';

const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 200;

function parsePagination(query = {}) {
  const rawPage = parseInt(query.page, 10);
  const rawLimit = parseInt(query.limit, 10);

  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const limit = Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, MAX_LIMIT) : DEFAULT_LIMIT;
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

function buildMeta({ page, limit, count }) {
  const totalPages = limit > 0 ? Math.ceil(count / limit) : 0;
  return {
    pagination: {
      page,
      limit,
      total: count,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

module.exports = { parsePagination, buildMeta, DEFAULT_LIMIT, MAX_LIMIT };

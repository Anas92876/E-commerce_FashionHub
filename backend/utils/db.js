// Helpers for converting between Postgres rows (snake_case) and the API's
// JSON shape (camelCase + Mongo-style `_id`, which the frontend relies on).

const toCamel = (str) => str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
const toSnake = (str) => str.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);

// Row -> API object. `nested` lists embedded relations (e.g. 'user') to convert too.
// JSONB columns (variants, items, shippingAddress) are stored camelCase already.
const toApi = (row, nested = []) => {
  if (!row) return row;
  const out = {};
  for (const [key, value] of Object.entries(row)) {
    if (key === 'id_text') continue;
    out[toCamel(key)] = value;
  }
  if (row.id) out._id = row.id;
  for (const key of nested) {
    if (out[key]) out[key] = toApi(out[key]);
  }
  return out;
};

// API object -> row for insert/update. Drops undefined values and id fields.
const toDb = (obj) => {
  const out = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined || key === '_id' || key === 'id') continue;
    out[toSnake(key)] = value;
  }
  return out;
};

// Is this a valid UUID? (Avoids Postgres "invalid input syntax for type uuid" errors,
// the equivalent of Mongoose CastError for bad ObjectIds.)
const isUuid = (value) =>
  typeof value === 'string' &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);

// Throw Supabase errors so Express error middleware / catch blocks handle them.
// Returns `data`; read `count` from the original result when you asked for one.
const check = ({ data, error }) => {
  if (error) {
    const err = new Error(error.message);
    err.code = error.code; // e.g. '23505' = unique violation
    throw err;
  }
  return data;
};

// Deterministic Mongo ObjectId (24 hex chars) -> UUID, used by the data migration
// so migrated rows keep a stable identity and pre-migration JWTs still resolve.
const objectIdToUuid = (objectId) => {
  const hex = `00000000${String(objectId).toLowerCase()}`;
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};

const isObjectId = (value) => typeof value === 'string' && /^[0-9a-f]{24}$/i.test(value);

// Normalize an id from a URL/body: UUIDs pass through, old ObjectIds (bookmarked
// links, carts saved in localStorage) are converted, anything else -> null.
const normalizeId = (value) => {
  if (isUuid(value)) return value.toLowerCase();
  if (isObjectId(value)) return objectIdToUuid(value);
  return null;
};

const UNIQUE_VIOLATION = '23505';

module.exports = {
  toApi,
  toDb,
  isUuid,
  isObjectId,
  objectIdToUuid,
  normalizeId,
  check,
  UNIQUE_VIOLATION,
};

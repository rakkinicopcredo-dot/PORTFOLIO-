// Shared Redis client. Files starting with "_" are not exposed as API routes.
// Works with the Upstash Redis integration from the Vercel Marketplace
// (sets KV_REST_API_URL / KV_REST_API_TOKEN) or a plain Upstash database
// (UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN).
const { Redis } = require("@upstash/redis");

const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = url && token ? new Redis({ url, token }) : null;

module.exports = { redis };

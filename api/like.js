// GET  /api/like?id=1 -> current like count for project 1
// POST /api/like (field: id) -> add 1 and return the new count
const { redis } = require("./_redis");

const KEY = "portfolio:likes";

module.exports = async function handler(req, res) {
    res.setHeader("Cache-Control", "no-store");

    if (!redis) {
        return res.status(500).json({ ok: false, reply: "Storage is not configured yet." });
    }

    const raw = (req.body && req.body.id) || (req.query && req.query.id) || 0;
    const id = parseInt(raw, 10);
    if (!Number.isInteger(id) || id < 1 || id > 999) {
        return res.status(400).json({ ok: false, reply: "Missing project id." });
    }

    try {
        let likes;
        if (req.method === "POST") {
            likes = await redis.hincrby(KEY, String(id), 1);
        } else if (req.method === "GET") {
            likes = Number(await redis.hget(KEY, String(id))) || 0;
        } else {
            res.setHeader("Allow", "GET, POST");
            return res.status(405).json({ ok: false, reply: "Method not allowed." });
        }
        return res.status(200).json({ ok: true, id, likes });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ ok: false, reply: "Something went wrong." });
    }
};

// GET  /api/messages -> saved messages, newest first (no email addresses)
// POST /api/messages -> save a new message (form fields: name, email, message)
const { redis } = require("./_redis");

const KEY = "portfolio:messages";
const MAX_KEPT = 200;

function formatTime(date) {
    // e.g. "Nov 25, 1:09 PM" (Philippine time, like the PHP version)
    return date.toLocaleString("en-US", {
        timeZone: "Asia/Manila",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit"
    });
}

function parseItem(item) {
    if (typeof item === "string") {
        try { return JSON.parse(item); } catch { return null; }
    }
    return item; // @upstash/redis may already return parsed objects
}

module.exports = async function handler(req, res) {
    res.setHeader("Cache-Control", "no-store");

    if (!redis) {
        return res.status(500).json({
            ok: false,
            reply: "Storage is not configured yet. Connect an Upstash Redis database in Vercel."
        });
    }

    try {
        if (req.method === "GET") {
            const items = await redis.lrange(KEY, 0, 49); // newest first (we LPUSH)
            const messages = items
                .map(parseItem)
                .filter(Boolean)
                .map((m) => ({ name: m.name || "", message: m.message || "", time: m.time || "" }));
            return res.status(200).json(messages);
        }

        if (req.method === "POST") {
            const body = req.body || {};
            const name = String(body.name || "").trim().slice(0, 80);
            const email = String(body.email || "").trim().slice(0, 120);
            const message = String(body.message || "").trim().slice(0, 1000);

            if (!name || !email || !message) {
                return res.status(400).json({ ok: false, reply: "Please fill in all the fields." });
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                return res.status(400).json({ ok: false, reply: "Please enter a valid email address." });
            }

            const entry = { name, email, message, time: formatTime(new Date()) };
            await redis.lpush(KEY, JSON.stringify(entry));
            await redis.ltrim(KEY, 0, MAX_KEPT - 1);

            return res.status(200).json({ ok: true, reply: `Thank you, ${name}! Your message was saved.` });
        }

        res.setHeader("Allow", "GET, POST");
        return res.status(405).json({ ok: false, reply: "Method not allowed." });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ ok: false, reply: "Something went wrong. Please try again." });
    }
};

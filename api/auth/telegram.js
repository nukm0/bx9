import crypto from "node:crypto";

const admins = () => new Set((process.env.TELEGRAM_ADMIN_IDS || "")
  .split(",").map((value) => value.trim()).filter(Boolean));

function verifyTelegramInitData(raw, token) {
  if (!token || !raw) throw new Error("Missing Telegram credentials or initData");
  const params = new URLSearchParams(raw);
  const receivedHash = params.get("hash");
  if (!receivedHash || !/^[a-f0-9]{64}$/i.test(receivedHash)) throw new Error("Invalid hash");
  params.delete("hash");
  const authDate = Number(params.get("auth_date"));
  const now = Math.floor(Date.now() / 1000);
  if (!authDate || Math.abs(now - authDate) > 86400) throw new Error("Expired initData");
  const checkString = [...params.entries()].sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`).join("\n");
  const secret = crypto.createHmac("sha256", "WebAppData").update(token).digest();
  const expected = crypto.createHmac("sha256", secret).update(checkString).digest();
  const actual = Buffer.from(receivedHash, "hex");
  if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) {
    throw new Error("Hash mismatch");
  }
  const user = JSON.parse(params.get("user") || "null");
  if (!user?.id) throw new Error("Missing user");
  return user;
}

export default function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "method_not_allowed" });
  }
  try {
    const initData = typeof req.body?.initData === "string" ? req.body.initData : "";
    const user = verifyTelegramInitData(initData, process.env.TELEGRAM_BOT_TOKEN);
    return res.status(200).json({
      user: {
        id: String(user.id),
        username: user.username || `tg_${user.id}`,
        firstName: user.first_name || "",
        lastName: user.last_name || "",
        photoUrl: user.photo_url || "",
        isAdmin: admins().has(String(user.id))
      }
    });
  } catch {
    return res.status(401).json({ error: "telegram_auth_failed" });
  }
}

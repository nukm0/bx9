import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

/** Verify Telegram Mini App initData on the server. Never trust a client-supplied user ID. */
export async function POST(request: NextRequest) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return NextResponse.json({ ok: false, error: "telegram_auth_not_configured" }, { status: 503 });
  }
  let body: { initData?: unknown };
  try { body = await request.json(); } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }
  if (typeof body.initData !== "string" || body.initData.length > 16_384) {
    return NextResponse.json({ ok: false, error: "missing_init_data" }, { status: 400 });
  }
  const params = new URLSearchParams(body.initData);
  const receivedHash = params.get("hash");
  if (!receivedHash || !/^[a-f0-9]{64}$/i.test(receivedHash)) {
    return NextResponse.json({ ok: false, error: "invalid_hash" }, { status: 401 });
  }
  params.delete("hash");
  const dataCheckString = [...params.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `${k}=${v}`).join("\n");
  const secret = createHmac("sha256", "WebAppData").update(token).digest();
  const expected = createHmac("sha256", secret).update(dataCheckString).digest();
  const supplied = Buffer.from(receivedHash, "hex");
  if (supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) {
    return NextResponse.json({ ok: false, error: "signature_mismatch" }, { status: 401 });
  }
  const authDate = Number(params.get("auth_date"));
  if (!Number.isFinite(authDate) || Math.abs(Date.now() / 1000 - authDate) > 86_400) {
    return NextResponse.json({ ok: false, error: "init_data_expired" }, { status: 401 });
  }
  let user: { id?: number; username?: string; first_name?: string; last_name?: string; photo_url?: string };
  try { user = JSON.parse(params.get("user") || "{}"); } catch {
    return NextResponse.json({ ok: false, error: "invalid_user" }, { status: 401 });
  }
  if (!Number.isSafeInteger(user.id) || Number(user.id) <= 0) {
    return NextResponse.json({ ok: false, error: "invalid_user_id" }, { status: 401 });
  }
  const id = Number(user.id);
  return NextResponse.json({
    ok: true,
    user: { id, username: user.username ?? null, firstName: user.first_name ?? null, lastName: user.last_name ?? null, photoUrl: user.photo_url ?? null },
    role: id === 998579758 ? "owner" : "user",
  }, { headers: { "Cache-Control": "no-store" } });
}

import { setRsvp } from "@/lib/store";
import { clean, isId } from "@/lib/validate";

export async function POST(req, { params }) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const name = clean(body.name, 40);
  if (!isId(id) || !name || !["yes", "maybe", "no"].includes(body.status)) {
    return Response.json({ error: "Datos no válidos" }, { status: 400 });
  }
  await setRsvp(id, name, body.status);
  return Response.json({ ok: true });
}

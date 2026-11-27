import { getEvents, createEvent } from "@/lib/store";
import { clean, isDate, isTime } from "@/lib/validate";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return Response.json(await getEvents());
  } catch (e) {
    return Response.json({ error: "No se pudieron cargar las quedadas" }, { status: 500 });
  }
}

export async function POST(req) {
  const body = await req.json().catch(() => ({}));
  const title = clean(body.title) || "Rocódromo";
  const place = clean(body.place);
  const createdBy = clean(body.name, 40);
  if (!createdBy || !isDate(body.date) || !isTime(body.time)) {
    return Response.json({ error: "Faltan nombre, día u hora" }, { status: 400 });
  }
  const event = await createEvent({ title, place, date: body.date, time: body.time, createdBy });
  return Response.json(event, { status: 201 });
}

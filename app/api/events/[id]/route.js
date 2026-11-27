import { deleteEvent } from "@/lib/store";
import { isId } from "@/lib/validate";

export async function DELETE(_req, { params }) {
  const { id } = await params;
  if (!isId(id)) return Response.json({ error: "Id no válido" }, { status: 400 });
  await deleteEvent(id);
  return new Response(null, { status: 204 });
}

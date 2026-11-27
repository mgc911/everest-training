// Almacenamiento en Vercel Blob.
// - Cada quedada es un blob inmutable: events/<id>.json
// - Cada respuesta es un blob vacío cuyo nombre lleva los datos:
//   rsvps/<eventId>/<nombre>/<timestamp>-<yes|no>.json  (gana la más reciente)
// Así nunca se sobrescribe nada y no hay problemas de caché ni de concurrencia.
import { put, list, del } from "@vercel/blob";

async function listAll(prefix) {
  const out = [];
  let cursor;
  do {
    const res = await list({ prefix, cursor, limit: 1000 });
    out.push(...res.blobs);
    cursor = res.hasMore ? res.cursor : undefined;
  } while (cursor);
  return out;
}

export async function getEvents() {
  const [eventBlobs, rsvpBlobs] = await Promise.all([
    listAll("events/"),
    listAll("rsvps/"),
  ]);
  const events = await Promise.all(
    eventBlobs.map(async (b) => {
      try {
        const r = await fetch(b.url);
        return r.ok ? await r.json() : null;
      } catch {
        return null;
      }
    })
  );
  const latest = {}; // eventId -> name -> {ts, status}
  for (const b of rsvpBlobs) {
    const [, eventId, encName, file] = b.pathname.split("/");
    const m = /^(\d+)-(yes|no)\.json$/.exec(file || "");
    if (!m) continue;
    const name = decodeURIComponent(encName);
    const ts = Number(m[1]);
    latest[eventId] ??= {};
    const cur = latest[eventId][name];
    if (!cur || cur.ts < ts) latest[eventId][name] = { ts, status: m[2] };
  }
  return events
    .filter(Boolean)
    .map((e) => {
      const r = latest[e.id] || {};
      const going = [], notGoing = [];
      for (const [name, v] of Object.entries(r)) {
        (v.status === "yes" ? going : notGoing).push(name);
      }
      return { ...e, going: going.sort(), notGoing: notGoing.sort() };
    })
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
}

export async function createEvent({ title, date, time, place, createdBy }) {
  const id = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
  const event = { id, title, date, time, place, createdBy, createdAt: new Date().toISOString() };
  await put(`events/${id}.json`, JSON.stringify(event), {
    access: "public",
    addRandomSuffix: false,
    contentType: "application/json",
  });
  // El creador va por defecto
  await setRsvp(id, createdBy, "yes");
  return event;
}

export async function setRsvp(eventId, name, status) {
  const path = `rsvps/${eventId}/${encodeURIComponent(name)}/${Date.now()}-${status}.json`;
  await put(path, "{}", { access: "public", addRandomSuffix: false, contentType: "application/json" });
}

export async function deleteEvent(eventId) {
  const blobs = [...(await listAll(`events/${eventId}.json`)), ...(await listAll(`rsvps/${eventId}/`))];
  if (blobs.length) await del(blobs.map((b) => b.url));
}

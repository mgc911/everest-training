"use client";
import { Fragment, useEffect, useMemo, useRef, useState, useCallback } from "react";

const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const pad = (n) => String(n).padStart(2, "0");
const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const fmt = (d) => d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });

export default function Home() {
  const [name, setName] = useState("");
  const [nameDraft, setNameDraft] = useState("");
  const [dayCount, setDayCount] = useState(28);
  const sentinel = useRef(null);
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState(null);
  const dlg = useRef(null);

  useEffect(() => {
    try { const n = localStorage.getItem("et-name"); if (n) setName(n); } catch {}
  }, []);

  const load = useCallback(async () => {
    try {
      const r = await fetch("/api/events", { cache: "no-store" });
      if (!r.ok) throw new Error();
      setEvents(await r.json());
      setError("");
    } catch { setError("No se pudieron cargar las quedadas."); }
  }, []);
  useEffect(() => { load(); const t = setInterval(load, 30000); return () => clearInterval(t); }, [load]);

  // La fecha de hoy se calcula en el navegador (no en el build) para que siempre sea la real
  const [now, setNow] = useState(null);
  useEffect(() => { setNow(new Date()); }, []);
  const todayKey = now ? iso(now) : "";
  const days = useMemo(() => {
    if (!now) return [];
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return Array.from({ length: dayCount }, (_, i) => {
      const d = new Date(start); d.setDate(d.getDate() + i);
      return { label: DAYS[(d.getDay() + 6) % 7], date: d, key: iso(d) };
    });
  }, [dayCount, now]);

  // Scroll infinito: carga 2 semanas más al llegar al final
  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) setDayCount((n) => n + 14);
    }, { rootMargin: "400px" });
    io.observe(el);
    return () => io.disconnect();
  }, [now]);

  function saveName(e) {
    e.preventDefault();
    const n = nameDraft.trim().slice(0, 40);
    if (!n) return;
    setName(n);
    try { localStorage.setItem("et-name", n); } catch {}
  }

  function openForm(date) {
    setForm({ date, time: "18:00", title: "Rocódromo", place: "", err: "" });
    setTimeout(() => dlg.current?.showModal(), 0);
  }

  async function submit(e) {
    e.preventDefault();
    const clash = events.filter((ev) => ev.date === form.date && ev.time === form.time);
    if (clash.length && !form.confirmed) {
      setForm({ ...form, confirmed: true, err: "", warn: clash.map((ev) => `"${ev.title}" de ${ev.createdBy}`).join(", ") });
      return;
    }
    const r = await fetch("/api/events", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...form, name }),
    });
    if (!r.ok) { const j = await r.json().catch(() => ({})); setForm({ ...form, err: j.error || "Error al crear" }); return; }
    dlg.current?.close(); setForm(null); load();
  }

  async function rsvp(id, status) {
    setEvents((evs) => evs.map((ev) => ev.id !== id ? ev : {
      ...ev,
      going: status === "yes" ? [...new Set([...ev.going, name])] : ev.going.filter((n) => n !== name),
      notGoing: status === "no" ? [...new Set([...ev.notGoing, name])] : ev.notGoing.filter((n) => n !== name),
    }));
    await fetch(`/api/events/${id}/rsvp`, {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, status }),
    });
    load();
  }

  async function remove(id) {
    setEvents((evs) => evs.filter((e) => e.id !== id));
    await fetch(`/api/events/${id}`, { method: "DELETE" });
    load();
  }

  function weekLabel(d) {
    const end = new Date(d); end.setDate(end.getDate() + 6);
    return `Semana del ${fmt(d)} al ${fmt(end)}`;
  }

  return (
    <div className="wrap">
      <header>
        <h1>🧗 Everest <span>Training</span></h1>
        {name ? (
          <div className="who">Hola, <strong style={{ color: "var(--ink)" }}>{name}</strong>
            <button className="btn small" onClick={() => { setNameDraft(name); setName(""); }}>Cambiar</button>
          </div>
        ) : (
          <form className="who" onSubmit={saveName}>
            <input placeholder="Tu nombre" value={nameDraft} onChange={(e) => setNameDraft(e.target.value)} autoFocus />
            <button className="btn primary">Entrar</button>
          </form>
        )}
      </header>

      {error && <p className="err">{error}</p>}

      <div className="days">
        {days.map((d, i) => {
          const list = events.filter((e) => e.date === d.key);
          const isMonday = d.date.getDay() === 1;
          return (
            <Fragment key={d.key}>
            {(i === 0 || isMonday) && (
              <div className="sep">{i === 0 && !isMonday ? `Esta semana · hasta el ${fmt(new Date(d.date.getFullYear(), d.date.getMonth(), d.date.getDate() + ((7 - d.date.getDay()) % 7)))}` : weekLabel(d.date)}</div>
            )}
            <section className={`day${d.key === todayKey ? " today" : ""}`}>
              <h2>{d.key === todayKey ? "Hoy · " : ""}{d.label} <small>{fmt(d.date)}</small></h2>
              {list.length === 0 && <span className="empty">Sin quedadas</span>}
              {list.map((ev) => {
                const mine = ev.going.includes(name) ? "yes" : ev.notGoing.includes(name) ? "no" : null;
                return (
                  <div key={ev.id} className="ev">
                    <div className="t">{ev.time} · {ev.title}</div>
                    <div className="meta">{ev.place ? `${ev.place} · ` : ""}propuesta por {ev.createdBy}</div>
                    <div className="ppl">
                      <div className="y">✔ Van ({ev.going.length}): {ev.going.join(", ") || "nadie aún"}</div>
                      {ev.notGoing.length > 0 && <div className="n">✘ No van ({ev.notGoing.length}): {ev.notGoing.join(", ")}</div>}
                    </div>
                    {name && (
                      <div className="row">
                        <button className={`btn small yes${mine === "yes" ? " on" : ""}`} onClick={() => rsvp(ev.id, "yes")}>Voy</button>
                        <button className={`btn small no${mine === "no" ? " on" : ""}`} onClick={() => rsvp(ev.id, "no")}>No voy</button>
                        {ev.createdBy === name && <button className="btn small" onClick={() => remove(ev.id)}>Borrar</button>}
                      </div>
                    )}
                  </div>
                );
              })}
              {name && <button className="btn small add" onClick={() => openForm(d.key)}>+ Proponer quedada</button>}
            </section>
            </Fragment>
          );
        })}
        <div ref={sentinel} className="empty" style={{ textAlign: "center", padding: 16 }}>Cargando más días…</div>
      </div>
      {!name && <p className="empty" style={{ marginTop: 16 }}>Escribe tu nombre arriba para proponer quedadas y responder.</p>}

      <dialog ref={dlg} onClose={() => setForm(null)}>
        {form && (
          <form onSubmit={submit}>
            <strong>Nueva quedada</strong>
            <label>Título<input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
            <label>Día<input type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value, confirmed: false, warn: "" })} /></label>
            <label>Hora<input type="time" required value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value, confirmed: false, warn: "" })} /></label>
            <label>Rocódromo (opcional)<input value={form.place} onChange={(e) => setForm({ ...form, place: e.target.value })} /></label>
            {form.warn && (
              <div className="warn">
                ⚠️ Ya hay una quedada ese día a las {form.time}: {form.warn}. ¿Seguro que quieres añadir otra a la misma hora?
              </div>
            )}
            {form.err && <span className="err">{form.err}</span>}
            <div className="row" style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button type="button" className="btn" onClick={() => dlg.current?.close()}>Cancelar</button>
              <button className="btn primary">{form.warn ? "Sí, añadirla" : "Crear"}</button>
            </div>
          </form>
        )}
      </dialog>
    </div>
  );
}

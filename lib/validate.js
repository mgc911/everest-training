export const clean = (s, max = 80) => (typeof s === "string" ? s.trim().slice(0, max) : "");
export const isDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s);
export const isTime = (s) => /^\d{2}:\d{2}$/.test(s);
export const isId = (s) => /^[a-z0-9]{6,30}$/.test(s);

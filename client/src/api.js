// Set VITE_API_URL in production (e.g. https://your-api.onrender.com). Leave empty in dev to use the Vite proxy.
const BASE = `${import.meta.env.VITE_API_URL || ''}/api/tasks`;

async function request(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data.errors ? Object.values(data.errors).join(', ') : data.message || 'Request failed';
    throw new Error(message);
  }
  return data;
}

export const api = {
  weeks: () => request(`${BASE}/weeks`),
  tasks: (params = {}) => request(`${BASE}?${new URLSearchParams(params)}`),
  create: (body) => request(BASE, { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => request(`${BASE}/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  remove: (id) => request(`${BASE}/${id}`, { method: 'DELETE' }),
};

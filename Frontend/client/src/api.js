export const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export async function api(path, options={}, tokenKey='teamToken') {
  const token = localStorage.getItem(tokenKey);
  const headers = { ...(options.body ? {'Content-Type':'application/json'} : {}), ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API}${path}`, {...options, headers});
  const data = await res.json().catch(()=>({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

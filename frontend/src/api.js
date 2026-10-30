const BASE_URL = '/api';

export function getToken() {
  return localStorage.getItem('token');
}

async function request(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => null);
  if (!data) {
    // Vite's proxy returns an empty 500 when the backend is down
    throw new Error('Cannot reach the backend. Is it running on port 5000?');
  }
  if (!res.ok) {
    throw new Error(data.message || `Request failed (${res.status})`);
  }
  return data;
}

export const api = {
  register: (email, password) => request('/auth/register', { method: 'POST', body: { email, password } }),
  login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password } }),
  requestOrder: (amount, walletAddress) =>
    request('/orders/request', { method: 'POST', body: { amount, walletAddress } }),
  getMyOrders: () => request('/orders'),
  getAllOrders: () => request('/admin/orders'),
  processOrder: (orderId) => request(`/admin/process/${orderId}`, { method: 'POST' }),
};

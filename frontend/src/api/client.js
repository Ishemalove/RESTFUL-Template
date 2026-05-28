const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('token');
}

export async function apiRequest(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg =
      (data.errors?.[0]?.msg) ||
      data.message ||
      'Request failed';
    throw new Error(msg);
  }
  return data;
}

export const authApi = {
  register: (body) => apiRequest('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) => apiRequest('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  verifyOtp: (body) => apiRequest('/auth/verify-otp', { method: 'POST', body: JSON.stringify(body) }),
  resendOtp: (body) => apiRequest('/auth/resend-otp', { method: 'POST', body: JSON.stringify(body) }),
  profile: () => apiRequest('/auth/profile'),
};

export const parkingApi = {
  list: (page = 1, limit = 10) => apiRequest(`/parkings?page=${page}&limit=${limit}`),
  create: (body) => apiRequest('/parkings', { method: 'POST', body: JSON.stringify(body) }),
  get: (code) => apiRequest(`/parkings/${code}`),
};

export const entryApi = {
  create: (body) => apiRequest('/entries', { method: 'POST', body: JSON.stringify(body) }),
  exit: (body) => apiRequest('/entries/exit', { method: 'POST', body: JSON.stringify(body) }),
  active: (page = 1, limit = 10, parkingCode) => {
    let q = `/entries/active?page=${page}&limit=${limit}`;
    if (parkingCode) q += `&parkingCode=${encodeURIComponent(parkingCode)}`;
    return apiRequest(q);
  },
};

export const reportApi = {
  outgoing: (params) => {
    const q = new URLSearchParams(params).toString();
    return apiRequest(`/reports/outgoing?${q}`);
  },
  entered: (params) => {
    const q = new URLSearchParams(params).toString();
    return apiRequest(`/reports/entered?${q}`);
  },
  occupancy: () => apiRequest('/reports/occupancy'),
};

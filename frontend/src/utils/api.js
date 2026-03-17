import axios from 'axios';

// ── Mock mode detection ───────────────────────────────────────────────────────
let MOCK_MODE = false;
let mockApi = null;

async function loadMock() {
  if (!mockApi) {
    const mod = await import('./mockApi.js');
    mockApi = mod.mockRequest;
  }
  return mockApi;
}

// ── Axios instance ────────────────────────────────────────────────────────────
const axiosInstance = axios.create({ baseURL: '/api', timeout: 5000 });

axiosInstance.interceptors.request.use(cfg => {
  const token = localStorage.getItem('agritrace_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// ── Unified API wrapper with auto mock fallback ───────────────────────────────
const api = {
  async _request(method, url, data) {
    if (!MOCK_MODE) {
      try {
        const token = localStorage.getItem('agritrace_token');
        const res = await axiosInstance.request({
          method, url,
          data: method !== 'get' ? data : undefined,
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        return res;
      } catch (err) {
        const isNetworkError = !err.response;
        const isServerDown   = err.response?.status >= 500;
        if (isNetworkError || isServerDown) {
          console.warn('⚠️  Backend unreachable — switching to mock mode');
          MOCK_MODE = true;
        } else {
          throw err;
        }
      }
    }
    // Mock fallback
    const mock = await loadMock();
    const result = await mock(method, url, data);
    if (result.status >= 400) {
      const error = new Error(result.data?.message || 'Request failed');
      error.response = result;
      throw error;
    }
    return result;
  },

  get:    (url)       => api._request('get',    `/api${url}`, null),
  post:   (url, data) => api._request('post',   `/api${url}`, data),
  put:    (url, data) => api._request('put',    `/api${url}`, data),
  delete: (url)       => api._request('delete', `/api${url}`, null),
};

export default api;

if (typeof window !== 'undefined') {
  window.__forceMock  = () => { MOCK_MODE = true;  console.log('Mock mode ON');  };
  window.__forceReal  = () => { MOCK_MODE = false; console.log('Mock mode OFF'); };
  window.__isMockMode = () => MOCK_MODE;
}

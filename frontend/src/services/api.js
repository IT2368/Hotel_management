import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 1. ERROR HANDLER FUNCTION (Add this near the top)
const handleApiError = (error) => {
  if (error.response) {
    // Server responded with status code outside 2xx
    console.error('API Error:', error.response.data);
    throw new Error(error.response.data.message || 'An error occurred');
  } else if (error.request) {
    // Request was made but no response received
    console.error('API Error: No response received');
    throw new Error('Network error - please check your connection');
  } else {
    // Something happened in setting up the request
    console.error('API Error:', error.message);
    throw new Error('Request setup error');
  }
};
// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && token !== "undefined") {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      console.warn("🔐 Unauthorized - token may be invalid or expired.");
      // Optional: redirect to login or trigger logout
    }
    return Promise.reject(err);
  }
);


// 2. REQUEST INTERCEPTOR (Authentication)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 3. API METHODS WITH ERROR HANDLING (Modified versions)
const guestApi = {
  createGuest: (guestData) => api.post('/guests', guestData).catch(handleApiError),
  getAllGuests: () => api.get('/guests').catch(handleApiError),
  getGuestById: (id) => api.get(`/guests/${id}`).catch(handleApiError),
  updateGuest: (id, guestData) => api.put(`/guests/${id}`, guestData).catch(handleApiError),
  deleteGuest: (id) => api.delete(`/guests/${id}`).catch(handleApiError),
  searchGuests: (query) => api.get('/guests/search', { params: { q: query } }).catch(handleApiError),
};

const authApi = {
  login: (credentials) => api.post('/auth/login', credentials).catch(handleApiError),
  register: (userData) => api.post('/auth/register', userData).catch(handleApiError),
  getUserById: (id) => api.get(`/users/${id}`).catch(handleApiError),
  deleteUser: (id) => api.delete(`/users/${id}`).catch(handleApiError),
  getUserBookings: (id) => api.get(`/users/${id}/bookings`).catch(handleApiError),
};

// 4. EXPORT
export default {
  ...guestApi,
  ...authApi,
  request: (config) => api.request(config).catch(handleApiError),
  sendAIMessage: (message) => api.post('/ai/chat', { message }).catch(handleApiError),
  // Feedback
  submitFeedback: (data) => api.post('/feedback', data).catch(handleApiError),
  getAllFeedback: () => api.get('/feedback').catch(handleApiError),
  deleteFeedback: (id) => api.delete(`/feedback/${id}`).catch(handleApiError),
  replyFeedback: (id, reply) => api.post(`/feedback/${id}/reply`, { reply }).catch(handleApiError),
  downloadFeedback: (rating) => api.get(`/feedback/download${rating ? '?rating=' + rating : ''}`).catch(handleApiError),
};

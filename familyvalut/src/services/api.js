import axios from 'axios';

// ✅ UPDATED: Use your deployed backend URL on Render
// Make sure the URL is exactly as provided by Render
const API_URL = 'https://family-vault-0mio.onrender.com/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - adds token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`📤 ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handles errors
api.interceptors.response.use(
  (response) => {
    console.log(`📥 ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.response?.status, error.response?.data);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ========== AUTH APIS ==========
export const registerUser = (userData) => {
  console.log('📝 Registering user:', userData.email);
  return api.post('/auth/register', userData);
};

export const loginUser = (userData) => {
  console.log('🔐 Logging in:', userData.email);
  return api.post('/auth/login', userData);
};

export const getCurrentUser = () => {
  console.log('👤 Getting current user');
  return api.get('/auth/me');
};

// ========== MEMBER APIS ==========
export const getMembers = () => {
  console.log('📋 Fetching members');
  return api.get('/members');
};

export const getMember = (id) => {
  console.log('📋 Fetching member:', id);
  return api.get(`/members/${id}`);
};

export const createMember = (memberData) => {
  console.log('➕ Creating member:', memberData.name);
  return api.post('/members', memberData);
};

export const updateMember = (id, memberData) => {
  console.log('✏️ Updating member:', id);
  return api.put(`/members/${id}`, memberData);
};

export const deleteMember = (id) => {
  console.log('🗑️ Deleting member:', id);
  return api.delete(`/members/${id}`);
};

// ========== DOCUMENT APIS ==========
export const getDocuments = () => {
  console.log('📄 Fetching documents');
  return api.get('/documents');
};

export const getDocument = (id) => {
  console.log('📄 Fetching document:', id);
  return api.get(`/documents/${id}`);
};

export const uploadDocument = (formData) => {
  console.log('📤 Uploading document');
  return api.post('/documents', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const deleteDocument = (id) => {
  console.log('🗑️ Deleting document:', id);
  return api.delete(`/documents/${id}`);
};

export const downloadDocument = (id) => {
  console.log('📥 Downloading document:', id);
  return api.get(`/documents/${id}/download`, { responseType: 'blob' });
};

// Default export
export default api;
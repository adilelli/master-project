import axios from 'axios';

// Base URL configuration
const API_BASE_URL = 'http://127.0.0.1:8000';

// Create Axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  maxBodyLength: Infinity,
});

// Add request interceptor to dynamically add token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken'); // Fetch token dynamically
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling (optional)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle token expiration or unauthorized access
      alert('Unauthorized: Please log in again.');
      // Redirect to login page or clear token
      localStorage.removeItem('accessToken');
      window.location.href = '/login'; // Replace with your login route
    }
    return Promise.reject(error);
  }
);

// Utility function for handling API requests
const handleRequest = async (config) => {
  try {
    const response = await axiosInstance(config);
    return response.data;
  } catch (error) {
    console.error('API Error:', error);
    alert(error.response.data.detail); // Propagate error for caller to handle
  }
};

// API Service Methods
const ApiService = {
  login: async (username, password) => {
    const data = { userName: username, password };
    const config = { method: 'post', url: '/auth/login', data };
    return handleRequest(config);
  },

  resetPasswordRequest: async (email) => {
    const data = { email: email};
    const config = { method: 'post', url: '/auth/reset-password/request', data };
    return handleRequest(config);
  },

  verifyResetToken: async (token) => {
    const config = { method: 'get', url: `/auth/reset-password/verify?token=${token}`};
    return handleRequest(config);
  },

  resetPassword: async (token, password) => {
    const data = { token: token , new_password: password};
    const config = { method: 'post', url: '/auth/reset-password', data };
    return handleRequest(config);
  },

  viewStaff: async () => {
    const config = { method: 'get', url: '/user' };
    return handleRequest(config);
  },

  viewProfile: async () => {
    const name = localStorage.getItem('userName');
    const config = { method: 'get', url: `/user?userName=${name}` };
    return handleRequest(config);
  },

  viewUser: async (role) => {
    const config = { method: 'get', url: `/user?userRole=${role}` };
    return handleRequest(config);
  },

  createUser: async (userName, password, userRole, email) => {
    const data = { userName, password, userRole, email };
    const config = { method: 'post', url: '/user', data };
    return handleRequest(config);
  },

  createUsers: async (data) => {
    const config = { method: 'post', url: '/user/list', data };
    return handleRequest(config);
  },

  updateUser: async (updateData) => {
    const config = { method: 'put', url: `/user`, data: updateData };
    return handleRequest(config);
  },

  deleteUser: async (id) => {
    const config = { method: 'delete', url: `/user/${id}` };
    return handleRequest(config);
  },

  prepareEvaluation: async (evaluationData) => {
    const config = { method: 'post', url: '/evaluation', data: evaluationData };
    return handleRequest(config);
  },

  updateEvaluation: async (evaluationId, evaluationData) => {
    const config = { method: 'put', url: `/evaluation/${evaluationId}`, data: evaluationData };
    return handleRequest(config);
  },

  viewEvaluations: async () => {
    const config = { method: 'get', url: `/evaluation` };
    return handleRequest(config);
  },

  viewEvaluationsbyId: async (id) => {
    const config = { method: 'get', url: `/evaluation?evaluationId=${id}` };
    return handleRequest(config);
  },

  viewSupervisedEvaluations: async (userName) => {
    const config = { method: 'get', url: `/evaluation?supervisorId=${userName}` };
    return handleRequest(config);
  },

  viewExaminerCount: async (userName) => {
    const config = { method: 'get', url: `/evaluation/examiner` };
    return handleRequest(config);
  },

  viewChairpersonCount: async (userName) => {
    const config = { method: 'get', url: `/evaluation/chairperson` };
    return handleRequest(config);
  },

  addOrUpdateSupervisor: async (evaluationId, supervisorData) => {
    const config = {
      method: 'put',
      url: `/evaluation/supervisor/${evaluationId}`,
      data: supervisorData,
    };
    return handleRequest(config);
  },

  addOrUpdateExaminer: async (evaluationId, examinerData) => {
    const config = {
      method: 'put',
      url: `/evaluation/examiner/${evaluationId}`,
      data: examinerData,
    };
    return handleRequest(config);
  },

  addOrUpdateChairperson: async (evaluationId, chairpersonData) => {
    const config = {
      method: 'put',
      url: `/evaluation/chairperson/${evaluationId}`,
      data: chairpersonData,
    };
    return handleRequest(config);
  },

  lockNomination: async (evaluationId, lock) => {
    const config = {
      method: 'put',
      url: `/evaluation/lock?evaluationId=${evaluationId}&lock=${lock}`,
    };
    return handleRequest(config);
  },
};

export default ApiService;

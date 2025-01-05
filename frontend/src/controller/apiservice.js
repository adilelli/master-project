// api.js
import axios from 'axios';

// Base configuration for Axios
const API_BASE_URL = 'http://127.0.0.1:8000';
const AUTHORIZATION_TOKEN = localStorage.getItem('accessToken'); // Replace with your actual token

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Authorization: AUTHORIZATION_TOKEN,
  },
  maxBodyLength: Infinity,
});

// Utility function for error handling
const handleRequest = async (config) => {
  try {
    const response = await axiosInstance(config);
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error; // Propagate the error for handling by the caller
  }
};

// API Methods
const ApiService = {
  login: async (username, password) => {
    const data = { userName: username, password };
    const config = { method: 'post', url: '/auth/login', data };
    const res =  handleRequest(config);
    return res;
  },

  viewStaff: async () => {
    const config = { method: 'get', url: '/user' };
    return handleRequest(config);
  },

  createUser: async (userName, password, userRole) => {
    const data = { userName, password, userRole };
    const config = { method: 'post', url: '/user', data };
    return handleRequest(config);
  },

  updateUser: async (userName, updateData) => {
    const config = { method: 'put', url: `/user/${userName}`, data: updateData };
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

  viewEvaluations: async () => {
    const config = { method: 'get', url: '/evaluation' };
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
      method: 'post',
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

  lockNomination: async (evaluationId, lock = true) => {
    const config = {
      method: 'put',
      url: `/evaluation/lock`,
      params: { evaluationId, lock },
    };
    return handleRequest(config);
  },
};

export default ApiService;

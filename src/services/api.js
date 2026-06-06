import axios from 'axios'

const API_URL = 'http://127.0.0.1:8000/api'

const api = axios.create({
  baseURL: API_URL,
})

// automatically attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const login = (username, password) =>
  api.post('/auth/login/', { username, password })

export const register = (username, email, password) =>
  api.post('/auth/register/', { username, email, password })

export const getApplications = () =>
  api.get('/applications/')

export const createApplication = (data) =>
  api.post('/applications/', data)

export const updateApplication = (id, data) =>
  api.put(`/applications/${id}/`, data)

export const deleteApplication = (id) =>
  api.delete(`/applications/${id}/`)

export const analyzeApplication = (id, cvText) =>
  api.post(`/applications/${id}/analyze/`, { cv_text: cvText })

export const getDashboardStats = () =>
  api.get('/dashboard/stats/')

export default api
import axios from 'axios'

const API = axios.create({ 
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000' 
})

export const workersAPI = {
  register:  (data)      => API.post('/workers/register', data),
  get:       (id)        => API.get(`/workers/${id}`),
  list:      ()          => API.get('/workers/'),
  dashboard: (id)        => API.get(`/workers/${id}/dashboard`),
  update:    (id, data)  => API.put(`/workers/${id}`, data),
}

export const policiesAPI = {
  create:           (data)   => API.post('/policies/create', data),
  get:              (id)     => API.get(`/policies/${id}`),
  getByWorker:      (wid)    => API.get(`/policies/worker/${wid}`),
  cancel:           (id)     => API.put(`/policies/${id}/cancel`),
  calculatePremium: (params) => API.post('/policies/calculate-premium', null, { params }),
}

export const disruptionsAPI = {
  scan:       (city) => API.post(`/disruptions/scan/${city}`),
  getActive:  (city) => API.get(`/disruptions/active/${city}`),
  list:       ()     => API.get('/disruptions/'),
}

export const claimsAPI = {
  list:           ()       => API.get('/claims/'),
  getByWorker:    (wid)    => API.get(`/claims/worker/${wid}`),
  review:         (id, d)  => API.post(`/claims/${id}/review`, d),
}

export const payoutsAPI = {
  getByWorker: (wid) => API.get(`/payouts/worker/${wid}`),
  list:        ()    => API.get('/payouts/'),
}

export const adminAPI = {
  dashboard:   () => API.get('/admin/dashboard'),
  fraudAlerts: () => API.get('/admin/fraud-alerts'),
}

// Phase 3 Analytics & Business API
export const analyticsAPI = {
  schedulerStatus:   () => API.get('/analytics/scheduler/status'),
  forecast:          () => API.get('/analytics/forecast'),
  forecastAllCities: () => API.get('/analytics/forecast/all-cities'),
  lossRatio:         () => API.get('/analytics/loss-ratio'),
  zonesSummary:      () => API.get('/analytics/zones/summary'),
  businessModel:     () => API.get('/analytics/business-model'),
  unitEconomics:     () => API.get('/analytics/business-model/unit-economics'),
  adminOverview:     () => API.get('/analytics/admin-overview')
}
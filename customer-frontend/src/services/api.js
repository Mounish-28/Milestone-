import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 8000,
  headers: {
    "Content-Type": "application/json"
  }
});

// Automatic dual-port fallback (seamless connection to 8001 or 8000)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      (error.code === "ERR_NETWORK" || error.message?.includes("Network Error") || error.code === "ECONNREFUSED") &&
      originalRequest &&
      !originalRequest._fallbackTried
    ) {
      originalRequest._fallbackTried = true;
      const currentBase = originalRequest.baseURL || BASE_URL;
      const alternateBase = currentBase.includes("8001") ? "http://localhost:8000" : "http://localhost:8001";
      originalRequest.baseURL = alternateBase;
      return axios(originalRequest);
    }
    return Promise.reject(error);
  }
);

// Authentication & Customer API
export const loginUserApi = async (userData) => {
  const response = await api.post("/auth/login", userData);
  return response.data;
};

export const googleSignInApi = async (googleData) => {
  const response = await api.post("/auth/google", googleData);
  return response.data;
};

export const customerSendOtpApi = async (data) => {
  const response = await api.post("/auth/customer-send-otp", data);
  return response.data;
};

export const customerVerifyOtpApi = async (data) => {
  const response = await api.post("/auth/customer-verify-otp", data);
  return response.data;
};

export const customerRegisterApi = async (data) => {
  const response = await api.post("/auth/customer-register", data);
  return response.data;
};

// Customer Addresses API
export const getCustomerAddressesApi = async (customerId) => {
  const response = await api.get(`/customers/${customerId}/addresses`);
  return response.data;
};

export const addCustomerAddressApi = async (customerId, addressData) => {
  const response = await api.post(`/customers/${customerId}/addresses`, addressData);
  return response.data;
};

export const deleteCustomerAddressApi = async (customerId, addressId) => {
  const response = await api.delete(`/customers/${customerId}/addresses/${addressId}`);
  return response.data;
};

export const setDefaultCustomerAddressApi = async (customerId, addressId) => {
  const response = await api.patch(`/customers/${customerId}/addresses/${addressId}/set-default`);
  return response.data;
};

// Global Transactions & Customer Orders API
export const getTransactions = async (params = {}) => {
  const response = await api.get("/transactions/", { params });
  return response.data;
};

export const getCustomerTransactions = async (customerName) => {
  const response = await api.get(`/transactions/customer/${encodeURIComponent(customerName)}`);
  return response.data;
};

export const getCustomerSummary = async (customerName) => {
  const response = await api.get(`/transactions/customer-summary/${encodeURIComponent(customerName)}`);
  return response.data;
};

export const createTransaction = async (txData) => {
  const response = await api.post("/transactions/", txData);
  return response.data;
};

export const cancelTransaction = async (txId) => {
  const response = await api.patch(`/transactions/${txId}/cancel`);
  return response.data;
};

export const getOrderTracking = async (orderRef) => {
  const response = await api.get(`/transactions/tracking/${encodeURIComponent(orderRef)}`);
  return response.data;
};

export const advanceOrderTracking = async (orderRef, stage = null, status = null) => {
  const response = await api.post(`/transactions/tracking/${encodeURIComponent(orderRef)}/advance`, { stage, status });
  return response.data;
};

// Products & Marketplace Catalog API
export const getProducts = async (params = {}) => {
  const response = await api.get("/products/", { params });
  return response.data;
};

export const getProduct = async (productId) => {
  const response = await api.get(`/products/${productId}`);
  return response.data;
};

export const getTopSellingRecommendations = async (category = null, limit = 4) => {
  const params = {};
  if (category && category !== "All") params.category = category;
  if (limit) params.limit = limit;
  const response = await api.get("/products/recommendations/top-selling", { params });
  return response.data;
};

export const getRelatedRecommendations = async (productId) => {
  const response = await api.get(`/products/recommendations/related/${productId}`);
  return response.data;
};

export const getProductReviews = async (productId) => {
  const response = await api.get(`/products/reviews/${productId}`);
  return response.data;
};

export const addProductReview = async (reviewData) => {
  const response = await api.post("/products/reviews/add", reviewData);
  return response.data;
};

// AI Assistant & Autonomous Shopping Agent API
export const queryAIAssistant = async (queryData) => {
  const response = await api.post("/assistant/query", queryData);
  return response.data;
};

export const approveBuyStep = async (stepData) => {
  const response = await api.post("/assistant/buy-step-approval", stepData);
  return response.data;
};

// Autonomous AI Agent Endpoints
export const runAutonomousAgent = async (taskPayload) => {
  const response = await api.post("/ai-agent/run", taskPayload);
  return response.data;
};

export const optimizeCartAgent = async (cartPayload) => {
  const response = await api.post("/ai-agent/optimize-cart", cartPayload);
  return response.data;
};

export const compareProductsAgent = async (productIds) => {
  const response = await api.post("/ai-agent/compare-products", { product_ids: productIds });
  return response.data;
};

export const sendVoiceCommandAgent = async (voicePayload) => {
  const response = await api.post("/ai-agent/voice-command", voicePayload);
  return response.data;
};

export const runVendorCopilot = async (vendorPayload) => {
  const response = await api.post("/ai-agent/vendor-copilot", vendorPayload);
  return response.data;
};

export const runAdminCopilot = async (adminPayload = {}) => {
  const response = await api.post("/ai-agent/admin-copilot", adminPayload);
  return response.data;
};

// Health Check
export const checkHealth = async () => {
  try {
    const response = await api.get("/health");
    return response.status === 200 && response.data?.status === "online";
  } catch {
    try {
      const fallback = await api.get("/");
      return fallback.status === 200;
    } catch {
      return false;
    }
  }
};

export default api;


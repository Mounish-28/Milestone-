import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 8000,
  headers: {
    "Content-Type": "application/json"
  }
});

// Authentication & Aadhaar KYC API
export const loginUserApi = async (userData) => {
  const response = await api.post("/auth/login", userData);
  return response.data;
};

export const googleSignInApi = async (googleData) => {
  const response = await api.post("/auth/google", googleData);
  return response.data;
};

export const requestAadhaarOtpApi = async (reqData) => {
  const response = await api.post("/auth/request-aadhaar-otp", reqData);
  return response.data;
};

export const verifyAadhaarOtpApi = async (otpData) => {
  const response = await api.post("/auth/verify-aadhaar-otp", otpData);
  return response.data;
};

export const sendSecurityEmailApi = async (emailData) => {
  const response = await api.post("/auth/send-security-email", emailData);
  return response.data;
};

export const forgotSecurityKeyApi = async (data) => {
  const response = await api.post("/auth/forgot-security-key", data);
  return response.data;
};

export const updateVendorStatusApi = async (statusData) => {
  const response = await api.patch("/auth/vendor-status", statusData);
  return response.data;
};

// Analytics & Dashboard Stats API
export const getAnalyticsSummary = async () => {
  const response = await api.get("/analytics/summary");
  return response.data;
};

export const getVendorAnalytics = async () => {
  const response = await api.get("/analytics/vendor-analytics");
  return response.data;
};

export const getSalesCharts = async () => {
  const response = await api.get("/analytics/sales-charts");
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

export const createTransaction = async (txData) => {
  const response = await api.post("/transactions/", txData);
  return response.data;
};

// Vendors API
export const getVendors = async () => {
  const response = await api.get("/vendors/");
  return response.data;
};

export const getVendor = async (vendorId) => {
  const response = await api.get(`/vendors/${vendorId}`);
  return response.data;
};

export const getVendorProducts = async (vendorId) => {
  const response = await api.get(`/vendors/${vendorId}/products`);
  return response.data;
};

export const getVendorStoreSummary = async (vendorId) => {
  const response = await api.get(`/vendors/${vendorId}/store-summary`);
  return response.data;
};

export const registerVendor = async (vendorData) => {
  const response = await api.post("/vendors/register", vendorData);
  return response.data;
};

export const updateVendor = async (vendorId, vendorData) => {
  const response = await api.put(`/vendors/${vendorId}`, vendorData);
  return response.data;
};

export const deleteVendor = async (vendorId) => {
  const response = await api.delete(`/vendors/${vendorId}`);
  return response.data;
};

// Customers API
export const getCustomers = async () => {
  const response = await api.get("/customers/");
  return response.data;
};

export const createCustomer = async (customerData) => {
  const response = await api.post("/customers/", customerData);
  return response.data;
};

export const updateCustomer = async (customerId, customerData) => {
  const response = await api.put(`/customers/${customerId}`, customerData);
  return response.data;
};

export const deleteCustomer = async (customerId) => {
  const response = await api.delete(`/customers/${customerId}`);
  return response.data;
};

// Products API
export const getProducts = async (params = {}) => {
  const response = await api.get("/products/", { params });
  return response.data;
};

export const getProduct = async (productId) => {
  const response = await api.get(`/products/${productId}`);
  return response.data;
};

export const createProduct = async (productData) => {
  const response = await api.post("/products/", productData);
  return response.data;
};

export const updateProduct = async (productId, productData) => {
  const response = await api.put(`/products/${productId}`, productData);
  return response.data;
};

export const deleteProduct = async (productId) => {
  const response = await api.delete(`/products/${productId}`);
  return response.data;
};

// Inventory & Stock Management API
export const getInventorySummary = async () => {
  const response = await api.get("/inventory/summary");
  return response.data;
};

export const getLowStockAlerts = async () => {
  const response = await api.get("/inventory/low-stock-alerts");
  return response.data;
};

export const updateProductStock = async (productId, stockData) => {
  const response = await api.put(`/inventory/stock/${productId}`, stockData);
  return response.data;
};

export const getInventoryForecast = async (productId) => {
  const response = await api.get(`/inventory/forecast/${productId}`);
  return response.data;
};

export const getInventoryTrackingLogs = async (params = {}) => {
  const response = await api.get("/inventory/tracking-logs", { params });
  return response.data;
};

export const getWarehouseZones = async () => {
  const response = await api.get("/inventory/warehouse-zones");
  return response.data;
};

export const simulateInventoryAction = async (action, vendorId = null) => {
  const payload = { action };
  if (vendorId) payload.vendor_id = vendorId;
  const response = await api.post("/inventory/simulate-stock", payload);
  return response.data;
};

// Customer Segmentation & Insights API
export const getCustomerSegmentation = async () => {
  const response = await api.get("/analytics/customer-segmentation");
  return response.data;
};

export const getCustomerInsights = async (customerId) => {
  const response = await api.get(`/analytics/customer-insights/${customerId}`);
  return response.data;
};

// Recommendations & Reviews API
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

export const searchVideoReviews = async (videoData) => {
  const response = await api.post("/products/reviews/video-review", videoData);
  return response.data;
};

// AI Assistant & Autonomous Agent API
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


// =========================================================================
// Admin Governance & 3-Tier Clearance Desk API (All 4 Admin Desks)
// =========================================================================

// Chairman Governance Summary
export const getGovernanceSummary = async () => {
  const response = await api.get("/admin/governance/summary");
  return response.data;
};

// Vendor Pipeline
export const getVendorPipeline = async (status = null) => {
  const params = {};
  if (status && status !== "ALL") params.status = status;
  const response = await api.get("/admin/vendor-pipeline", { params });
  return response.data;
};

export const applyVendorPipeline = async (vendorData) => {
  const response = await api.post("/admin/vendor-pipeline/apply", vendorData);
  return response.data;
};

// Admin Applicants & Resumes Onboarding
export const getAdminApplicants = async (status = null) => {
  const params = {};
  if (status && status !== "ALL") params.status = status;
  const response = await api.get("/admin/applicants", { params });
  return response.data;
};

export const registerAdminApplicant = async (applicantData) => {
  const response = await api.post("/admin/applicants/register", applicantData);
  return response.data;
};

export const approveAdminApplicant = async (applicantRef, approveData) => {
  const response = await api.post(`/admin/applicants/${applicantRef}/approve`, approveData);
  return response.data;
};

export const rejectAdminApplicant = async (applicantRef, rejectData) => {
  const response = await api.post(`/admin/applicants/${applicantRef}/reject`, rejectData);
  return response.data;
};

// Chairman Directives & Tasks
export const getChairmanTasks = async (targetAdmin = null) => {
  const params = {};
  if (targetAdmin) params.target_admin = targetAdmin;
  const response = await api.get("/admin/tasks", { params });
  return response.data;
};

export const createChairmanTask = async (taskData) => {
  const response = await api.post("/admin/tasks", taskData);
  return response.data;
};

export const updateChairmanTask = async (taskRef, updateData) => {
  const response = await api.patch(`/admin/tasks/${taskRef}`, updateData);
  return response.data;
};

// Chairman Inquiries & Dialogues
export const getChairmanInquiries = async (targetAdmin = null) => {
  const params = {};
  if (targetAdmin) params.target_admin = targetAdmin;
  const response = await api.get("/admin/inquiries", { params });
  return response.data;
};

export const createChairmanInquiry = async (inqData) => {
  const response = await api.post("/admin/inquiries", inqData);
  return response.data;
};

export const replyToChairmanInquiry = async (inquiryRef, replyData) => {
  const response = await api.post(`/admin/inquiries/${inquiryRef}/reply`, replyData);
  return response.data;
};

// Stage 1: Executor Admin Due-Diligence Desk
export const executorApproveStage1 = async (appRef, approvalData) => {
  const response = await api.post(`/admin/executor/approve/${appRef}`, approvalData);
  return response.data;
};

export const executorCancelStage1 = async (appRef, cancelData) => {
  const response = await api.post(`/admin/executor/cancel/${appRef}`, cancelData);
  return response.data;
};

// Stage 2: Verifier Admin Geolocation & Safety Audit Desk
export const verifierApproveStage2 = async (appRef, approvalData) => {
  const response = await api.post(`/admin/verifier/approve/${appRef}`, approvalData);
  return response.data;
};

export const verifierReturnStage2 = async (appRef, returnData) => {
  const response = await api.post(`/admin/verifier/return/${appRef}`, returnData);
  return response.data;
};

export const verifierCancelStage2 = async (appRef, cancelData) => {
  const response = await api.post(`/admin/verifier/cancel/${appRef}`, cancelData);
  return response.data;
};

// Stage 3: Approver Admin Bond & Official Seal Authority Desk
export const approverSealStage3 = async (appRef, sealData) => {
  const response = await api.post(`/admin/approver/approve/${appRef}`, sealData);
  return response.data;
};

export const approverReturnStage3 = async (appRef, returnData) => {
  const response = await api.post(`/admin/approver/return/${appRef}`, returnData);
  return response.data;
};

export const approverCancelStage3 = async (appRef, cancelData) => {
  const response = await api.post(`/admin/approver/cancel/${appRef}`, cancelData);
  return response.data;
};

// Stage 4: Supreme Chairman Desk
export const chairmanFinalApprove = async (appRef, approvalData) => {
  const response = await api.post(`/admin/chairman/approve/${appRef}`, approvalData);
  return response.data;
};

export const chairmanReject = async (appRef, rejectData) => {
  const response = await api.post(`/admin/chairman/reject/${appRef}`, rejectData);
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

// =========================================================================
// Milestone 5: Autonomous AI Agent Weekly Store Audit & Strategic Advisory
// =========================================================================
export const runWeeklyVendorAnalysisApi = async (payload) => {
  const response = await api.post("/ai-agent/weekly-vendor-analysis", payload);
  return response.data;
};

export const getWeeklyVendorReportsApi = async (vendorId) => {
  const response = await api.get(`/ai-agent/weekly-vendor-reports/${vendorId}`);
  return response.data;
};

export const sendWeeklyAdvisoryEmailApi = async (payload) => {
  const response = await api.post("/ai-agent/send-weekly-advisory-email", payload);
  return response.data;
};

export const applyStrategicDiscountApi = async (payload) => {
  const response = await api.post("/ai-agent/apply-strategic-discount", payload);
  return response.data;
};

export default api;
/**
 * Customer Authentication & Session Management Utilities
 * Single source of truth for customer login, session persistence, and logout.
 */

export const AUTH_KEYS = [
  "customerToken",
  "customerLoggedIn",
  "authSessionActive",
  "isLoggedIn",
  "customerId",
  "userName",
  "userEmail",
  "userPhone",
  "userAddress",
  "membershipTier"
];

/**
 * Checks whether a customer is currently authenticated
 */
export function isCustomerAuthenticated() {
  return Boolean(
    localStorage.getItem("customerToken") ||
    localStorage.getItem("customerLoggedIn") === "true" ||
    localStorage.getItem("authSessionActive") === "true" ||
    localStorage.getItem("isLoggedIn") === "true"
  );
}

/**
 * Returns the stored customer profile data
 */
export function getCustomerUser() {
  return {
    id: localStorage.getItem("customerId") || "1",
    name: localStorage.getItem("userName") || "Customer",
    email: localStorage.getItem("userEmail") || "",
    phone: localStorage.getItem("userPhone") || "",
    address: localStorage.getItem("userAddress") || "Flat 402, Sunshine Heights, Mumbai - 400050",
    membershipTier: localStorage.getItem("membershipTier") || "Diamond",
    isAuthenticated: isCustomerAuthenticated()
  };
}

/**
 * Stores customer credentials and notifies listeners
 */
export function loginCustomer(customerData = {}, token = null) {
  const authToken = token || ("token_" + Date.now());
  const id = customerData.id || 1;
  const name = customerData.name || "Aarav Sharma";
  const email = customerData.email || "aarav@gmail.com";
  const phone = customerData.phone || "+91 9876543210";
  const address = customerData.address || customerData.address_line || "Flat 402, Sunshine Heights, Mumbai - 400050";
  const tier = customerData.membership_tier || customerData.membershipTier || "Diamond";

  localStorage.setItem("customerToken", authToken);
  localStorage.setItem("customerLoggedIn", "true");
  localStorage.setItem("authSessionActive", "true");
  localStorage.setItem("isLoggedIn", "true");
  localStorage.setItem("customerId", String(id));
  localStorage.setItem("userName", name);
  localStorage.setItem("userEmail", email);
  localStorage.setItem("userPhone", phone);
  localStorage.setItem("userAddress", address);
  localStorage.setItem("membershipTier", tier);

  // Dispatch events so React components update immediately
  window.dispatchEvent(new Event("authChanged"));
  window.dispatchEvent(new Event("storage"));

  return { id, name, email, phone, address, membershipTier: tier };
}

/**
 * Clears all customer session tokens and notifies listeners
 */
export function logoutCustomer() {
  AUTH_KEYS.forEach(key => localStorage.removeItem(key));

  // Dispatch events to reactively trigger redirection to /login
  window.dispatchEvent(new Event("authChanged"));
  window.dispatchEvent(new Event("storage"));
}

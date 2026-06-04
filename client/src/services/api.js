import { getAllCampaigns } from "@/Hooks/Redux/Slices/CampaignSlice";
import { getAllCompanies } from "@/Hooks/Redux/Slices/cleaningCompanySlice";
import axios from "axios";
import Cookies from "js-cookie";

// Base URL //
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4002",
  withCredentials: true,
});

// Copy your interceptor from lib/axios.ts
api.interceptors.request.use((config) => {
  return config;
});

// ================= 1. AUTH SERVICE ================= //

export const authService = {
  signup: (userData) => api.post("/signup", userData).then((res) => res.data),

  verifyEmail: (token) =>
    api.get(`/verify-email/${token}`).then((res) => res.data),

  login: (credentials) =>
    api.post("/login", credentials).then((res) => res.data),

  // No token payload parameters required—handled by cookies natively
  refreshToken: () => api.post("/refresh-token").then((res) => res.data),

  forgotPassword: (email) => 
    api.post("/forgot-password", { email }).then((res) => res.data),

  getProfile: () => api.get("/profile").then((res) => res.data),

  updateProfile: ()=> api.put("/update-profile").then((res) => res.data),

  logout: () => api.post("/logout").then((res) => res.data),

  getAdminDashboard: () => api.get("/admin-dashboard").then((res) => res.data),

  getUserDashboard: () => api.get("/user-dashboard").then((res) => res.data),

  getNgoDashboard: () => api.get("/ngo-dashboard").then((res) => res.data),

  getCleaningCompanyDashboard: () =>
    api.get("/cleaning-company-dashboard").then((res) => res.data),

  getCleaningRequests: () => 
    api.get("/cleaning-request").then((res) => res.data),

  viewGlobalActivities: () =>
    api.get("/admin/activities").then((res) => res.data),

  getDashboardAnalytics: () =>
    api.get("/admin/dashboard-analytics").then((res) => res.data),
};

// ================= 2. USER SERVICE ================= //
export const userService = {
  getProfile: () => api.get("/user/profile").then((res) => res.data),

  updateProfile: (profileData) =>
    api.put("/user/update-profile", profileData).then((res) => res.data),

  deleteProfile: () =>
    api.delete("/user/delete-profile").then((res) => res.data),

  uploadProfilePicture: (formData) =>
    api.post("/user/upload-profile-picture", formData).then((res) => res.data),

  getDashboard: () => api.get("/user/dashboard").then((res) => res.data),
};

// ================= 3. ADMIN SERVICE ================= //
// export const adminService = {
//   viewAllUsers: () => api.get("/admin/users").then((res) => res.data),

//   viewSingleUser: (userId) =>
//     api.get(`/admin/users/${userId}`).then((res) => res.data),

//   updateUserRole: (userId, roleData) =>
//     api
//       .put(`/admin/users/update-role/${userId}`, roleData)
//       .then((res) => res.data),

//   deleteUser: (userId) =>
//     api.delete(`/admin/users/delete/${userId}`).then((res) => res.data),

//   restoreUser: (userId) =>
//     api.put(`/admin/users/restore/${userId}`).then((res) => res.data),

//   verifyUser: (userId) =>
//     api.put(`/admin/users/verify/${userId}`).then((res) => res.data),

//   viewAllCompanies: () => api.get("/admin/companies").then((res) => res.data),

//   approveCleaningRequest: (requestId) =>
//     api
//       .put(`/admin/cleaning-request/approve/${requestId}`)
//       .then((res) => res.data),

//  rejectCleaningRequest: (requestId, reason) =>
//   api
//     .put(`/admin/cleaning-request/reject/${requestId}`, { reason }) // Send reason in body
//     .then((res) => res.data),


//   toggleCompanyApproval: (id, isApproved) =>
//     api.put(`/admin/company/approve/${id}`, { isApproved }).then((res) => res.data),

//   getAllCompanies: () => api.get("/companies/all").then((res) => res.data),

//   // ==========================================
//   // 🤝 NGO & CAMPAIGNS MANAGEMENT
//   // ==========================================
//   getAllNgos: () => api.get("/ngo/all").then((res) => res.data),
  
// getAllCampaigns: () => api.get("/admin/campaigns").then((res) => res.data),
//   viewCampaignsForAdmin: () =>
//     api.get("/ngo/admin/view-campaigns").then((res) => res.data),

//   approveNgo: (ngoId) =>
//     api.put(`/admin/ngo/approve/${ngoId}`).then((res) => res.data),

//   approveCampaign: (id) =>
//     api.put(`/admin/campaign/approve/${id}`).then((res) => res.data),

//   approveCertificate: (id) =>
//     api.put(`/admin/certificate/approve/${id}`).then((res) => res.data),

//   // ==========================================
//   // 🎁 REWARDS MANAGEMENT
//   // ==========================================
//   approveReward: (rewardId) =>
//     api.put(`/admin/reward/approve/${rewardId}`).then((res) => res.data),

//   rejectReward: (rewardId) =>
//     api.put(`/admin/reward/reject/${rewardId}`).then((res) => res.data),

//   // ==========================================
//   // 📢 ANNOUNCEMENTS & ENGAGEMENT
//   // ==========================================
//   createAnnouncement: (announcementData) =>
//     api
//       .post("/admin/announcement/create", announcementData)
//       .then((res) => res.data),

//   viewAllAnnouncements: () =>
//     api.get("/admin/announcements").then((res) => res.data),

//   // ==========================================
//   // 📊 SYSTEM METRICS & LOGS
//   // ==========================================
//   viewGlobalActivities: () =>
//     api.get("/admin/cleaning-requests").then((res) => res.data),

//   getDashboardAnalytics: () =>
//     api.get("/admin/dashboard-analytics").then((res) => res.data),
// };

export const adminService = {
  // ==========================================
  // 👥 USER MANAGEMENT PIPELINE
  // ==========================================
  viewAllUsers: () => 
    api.get("/admin/users").then((res) => res.data),

  viewSingleUser: (userId) =>
    api.get(`/admin/users/${userId}`).then((res) => res.data),

  updateUserRole: (userId, roleData) =>
    api.put(`/admin/users/update-role/${userId}`, roleData).then((res) => res.data),

  deleteUser: (userId) =>
    api.delete(`/admin/users/delete/${userId}`).then((res) => res.data),

  restoreUser: (userId) =>
    api.put(`/admin/users/restore/${userId}`).then((res) => res.data),

  verifyUser: (userId) =>
    api.put(`/admin/users/verify/${userId}`).then((res) => res.data),

  // ==========================================
  // 🧹 CLEANING REQUESTS & COMPANIES
  // ==========================================
  getCleaningRequests: () => 
    api.get("/admin/cleaning-request").then((res) => res.data),

  approveCleaningRequest: (requestId) =>
    api.put(`/admin/cleaning-request/approve/${requestId}`).then((res) => res.data),

  rejectCleaningRequest: (requestId, reason) =>
    api.put(`/admin/cleaning-request/reject/${requestId}`, { reason }).then((res) => res.data),

  viewAllCompanies: () => 
    api.get("/admin/companies").then((res) => res.data),

  toggleCompanyApproval: (id) =>
    api.put(`/admin/company/approve/${id}`).then((res) => res.data),

  getAllCompanies: () => 
    api.get("/admin/companies-all").then((res) => res.data), // ✅ Fixed route token mismatch

  // ==========================================
  // 🤝 NGO & CAMPAIGNS MANAGEMENT
  // ==========================================
  getAllNgos: () => 
    api.get("/admin/ngos-all").then((res) => res.data), // ✅ Fixed route token mismatch
  
  getAllCampaigns: () => 
    api.get("/admin/campaigns").then((res) => res.data),

  viewCampaignsForAdmin: () =>
    api.get("/ngo/admin/view-campaigns").then((res) => res.data),

  approveNgo: (ngoId) =>
    api.put(`/admin/ngo/approve/${ngoId}`).then((res) => res.data),

  approveCampaign: (id) =>
    api.put(`/admin/campaign/approve/${id}`).then((res) => res.data),

  approveCertificate: (id) =>
    api.put(`/admin/certificate/approve/${id}`).then((res) => res.data),

  // ==========================================
  // 🎁 REWARDS MANAGEMENT
  // ==========================================
  approveReward: (rewardId) =>
    api.put(`/admin/reward/approve/${rewardId}`).then((res) => res.data),

  rejectReward: (rewardId) =>
    api.put(`/admin/reward/reject/${rewardId}`).then((res) => res.data),

  createAnnouncement: (announcementData) =>
    api.post("/admin/announcement/create", announcementData).then((res) => res.data),

  viewAllAnnouncements: () =>
    api.get("/admin/announcements").then((res) => res.data),

  // ==========================================
  // 📊 SYSTEM METRICS & LOGS
  // ==========================================
  viewGlobalActivities: () =>
    api.get("/admin/activities").then((res) => res.data), // ✅ Aligned directly with backend router target

  getDashboardAnalytics: () =>
    api.get("/admin/dashboard-analytics").then((res) => res.data),
};

// ================= 4. ANNOUNCEMENT SERVICE ================= //
export const announcementService = {
  createAnnouncement: (announcementData) =>
    api.post("/annoucement", announcementData).then((res) => res.data),

  editAnnouncement: (id) =>
    api.get(`/annoucement/${id}/edit`).then((res) => res.data),

  updateAnnouncement: (id, announcementData) =>
    api.put(`/annoucement/${id}`, announcementData).then((res) => res.data),

  deleteAnnouncement: (id) =>
    api.delete(`/annoucement/${id}`).then((res) => res.data),
};

// ================= 5. NGO SERVICE ================= //

export const ngoService = {
  addNgo: (ngoData) => api.post("/ngo/add", ngoData).then((res) => res.data),

  updateNgo: async (formData) => {
    const response = await api.put("/ngo/update", formData, {
      withCredentials: true,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  deleteNgo: () => api.delete("/ngo/delete").then((res) => res.data),

  // New endpoint: Fetches only the NGO belonging to the currently logged-in token
  getOwnNgo: () => api.get("/ngo/me").then((res) => res.data),

  getSingleNgo: (id) => api.get(`/ngo/single/${id}`).then((res) => res.data),

  getAllNgo: () => api.get("/ngo/all").then((res) => res.data),
  getMyNgo: () => api.get("/ngo/me").then((res) => res.data),
  updateNgoBadge: (ngoId, data) =>
    api.put(`/badge/update-ngo-badge/${ngoId}`, data).then((res) => res.data),
  summarizeAbout: async (description) => {
    const response = await fetch("/ai/summarize-ngo", {
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ description }),
    });
    return await response.json();
  },
  getOwnCampaigns: () => api.get("/ngo/campaign/my").then((res) => res.data),
};

// ================= 6. CLEANING COMPANY SERVICE ================= //
export const cleaningCompanyService = {
  addCleaningCompany: (companyData) =>
    api.post("/cleaningcompany/add", companyData).then((res) => res.data),

  updateCleaningCompany: (companyData) =>
    api.put("/cleaningcompany/update", companyData).then((res) => res.data),

  deleteCleaningCompany: () =>
    api.delete("/cleaningcompany/delete").then((res) => res.data),

  // New endpoint: Fetches only the company profile linked directly to the logged-in user token
  getOwnCompanyProfile: () =>
    api.get("/cleaningcompany/me").then((res) => res.data),

  // New endpoint: Fetches the requests pipeline linked directly to this logged-in company context
  getCompanyCleaningRequests: () =>
    api.get("/cleaningcompany/requests/me").then((res) => res.data),

  getSingleCompany: (id) =>
    api.get(`/cleaningcompany/single/${id}`).then((res) => res.data),

  getAllCompanies: () =>
    api.get("/cleaningcompany/all").then((res) => res.data),

  acceptCleaningRequest: (requestId) =>
    api
      .put(`/cleaningcompany/accept-request/${requestId}`)
      .then((res) => res.data),

  rejectCleaningRequest: (requestId) =>
    api
      .put(`/cleaningcompany/reject-request/${requestId}`)
      .then((res) => res.data),

  updateCleaningStatus: (requestId, statusData) =>
    api
      .put(`/cleaningcompany/update-status/${requestId}`, statusData)
      .then((res) => res.data),

  uploadWorkProof: (requestId, formData) =>
    api
      .put(`/cleaningcompany/upload-proof/${requestId}`, formData)
      .then((res) => res.data),

  companyReview: (reviewData) =>
    api.post("/cleaningcompany/review", reviewData).then((res) => res.data),
};

//---- CLEANING REQUEST --- //

export const cleaningRequestsService = {
  getOwnCleaningRequests: () =>
    api.get("/ngo/cleaning-request/my-requests").then((res) => res.data),
  createCleaningRequest: (formData) =>
    api
      .post("/ngo/cleaning-request/create", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => res.data),

  adminApproveRequest: (id) =>
    api.patch(`/cleaningrequests/${id}/approve`).then((res) => res.data),

  updateStatus: (id, statusData) =>
    api
      .patch(`/cleaningrequests/${id}/status`, statusData)
      .then((res) => res.data),
};

// ================= 8. CAMPAIGN SERVICE ================= //
export const campaignService = {
  createCampaign: (campaignData) =>
    api.post("/ngo/campaign/create", campaignData).then((res) => res.data),

  updateCampaign: (id, campaignData) =>
    api.put(`/ngo/campaign/update/${id}`, campaignData).then((res) => res.data),

  deleteCampaign: (id) =>
    api.delete(`/ngo/campaign/delete/${id}`).then((res) => res.data),

  getAllCampaigns: () => api.get("/campaign/all").then((res) => res.data),

  approveCampaign: (campaignId) =>
    api.put(`/campaign/approve-campaign/${campaignId}`).then((res) => res.data),

  applyForCampaign: (campaignId, formData) =>
    api.post(`/campaign/apply/${campaignId}`, formData).then((res) => res.data),

  getAllVolunteerRequests: () =>
    api.get("/campaign/volunteer-requests").then((res) => res.data),

  getNgoVolunteerRequests: () =>
    api.get("/campaign/ngo/volunteer-requests").then((res) => res.data),
};

//  ----- CONTACT SERVICE ----- //
export const contactService = {
  sendMessage: async (contactData) => {
    const response = await api.post("/contact/send", contactData);

    return response.data;
  },
};

// ================= 9. GOVT OFFICER SERVICE ================= //
export const govtOfficerService = {
  viewEliteNgos: () =>
    api.get("/govtofficer/elite-ngos").then((res) => res.data),

  issueRewardCertificate: (rewardData) =>
    api.post("/govtofficer/issue-reward", rewardData).then((res) => res.data),

  verifyImpactData: (ngoId) =>
    api.get(`/govtofficer/verify-impact/${ngoId}`).then((res) => res.data),

  nominateForAward: (nominationData) =>
    api
      .post("/govtofficer/nominate-award", nominationData)
      .then((res) => res.data),

  approveEliteBadge: (badgeData) =>
    api.post("/govtofficer/approve-badge", badgeData).then((res) => res.data),
};

// ================= 10. REVIEW SERVICE ================= //
export const reviewService = {
  createReview: (reviewData) =>
    api.post("/ngo/review/create", reviewData).then((res) => res.data),

  updateReview: (id, reviewData) =>
    api.put(`/ngo/review/update/${id}`, reviewData).then((res) => res.data),

  deleteReview: (id) =>
    api.delete(`/ngo/review/delete/${id}`).then((res) => res.data),

  getReview: (reviewId) =>
    api.get(`/review/single/${reviewId}`).then((res) => res.data),

  getCompanyReviews: (companyId) =>
    api.get(`/review/company/${companyId}`).then((res) => res.data),

  getNgoReviews: (ngoId) =>
    api.get(`/review/ngo/${ngoId}`).then((res) => res.data),

  getOwnReviews: () => api.get("/review/my-reviews").then((res) => res.data),
};

// ================= 11. CERTIFICATE SERVICE ================= //
export const certificateService = {
  issueCertificate: (certificateData) =>
    api.post("/certificate/issue", certificateData).then((res) => res.data),

  getAllCertificates: () => api.get("/certificate/all").then((res) => res.data),

  getSingleCertificate: (certificateId) =>
    api.get(`/certificate/single/${certificateId}`).then((res) => res.data),

  getUserCertificates: (userId) =>
    api.get(`/certificate/user/${userId}`).then((res) => res.data),

  updateCertificate: (certificateId, certificateData) =>
    api
      .put(`/certificate/update/${certificateId}`, certificateData)
      .then((res) => res.data),

  deleteCertificate: (certificateId) =>
    api.delete(`/certificate/delete/${certificateId}`).then((res) => res.data),

  certificateAnalytics: () =>
    api.get("/certificate/analytics").then((res) => res.data),

  approveCertificate: (certificateId) =>
    api.put(`/certificate/approve/${certificateId}`).then((res) => res.data),

  rejectCertificate: (certificateId) =>
    api.put(`/certificate/reject/${certificateId}`).then((res) => res.data),

  viewCertificates: () => api.get("/ngo/certificates").then((res) => res.data),

  getApprovedCertificates: () =>
    api.get("/certificate/approved").then((res) => res.data),
};

// ================= 12. REWARD SERVICE ================= //
export const rewardService = {
  createReward: (rewardData) =>
    api.post("/reward/create", rewardData).then((res) => res.data),

  approveReward: (rewardId) =>
    api.patch(`/reward/approve/${rewardId}`).then((res) => res.data),

  updateReward: (rewardId, rewardData) =>
    api.put(`/reward/update/${rewardId}`, rewardData).then((res) => res.data),

  deleteReward: (rewardId) =>
    api.delete(`/reward/delete/${rewardId}`).then((res) => res.data),

  getSingleReward: (rewardId) =>
    api.get(`/reward/single/${rewardId}`).then((res) => res.data),

  getAllRewards: () => api.get("/reward/all").then((res) => res.data),

  getNgoRewardDashboard: (ngoId) =>
    api.get(`/reward/ngo-dashboard/${ngoId}`).then((res) => res.data),

  getGlobalRewardDashboard: () =>
    api.get("/reward/global-dashboard").then((res) => res.data),
};

// ================= 13. BADGE SERVICE ================= //
export const badgeService = {
  createBadge: (badgeData) =>
    api.post("/badge/create", badgeData).then((res) => res.data),

  // === ADD THIS LINE TO MATCH YOUR POST ROUTE ===
  updateNgoBadge: (ngoId, badgeData) =>
    api
      .post(`/badge/update-ngo-badge/${ngoId}`, badgeData)
      .then((res) => res.data),
  // ==============================================

  updateBadge: (badgeId, badgeData) =>
    api.put(`/badge/update/${badgeId}`, badgeData).then((res) => res.data),

  deleteBadge: (badgeId) =>
    api.delete(`/badge/delete/${badgeId}`).then((res) => res.data),

  getNgoBadgeAnalytics: () =>
    api.get("/badge/ngo-analytics").then((res) => res.data),

  getSingleBadge: (badgeId) =>
    api.get(`/badge/single/${badgeId}`).then((res) => res.data),

  viewBadges: () => api.get("/ngo/badges").then((res) => res.data),

  getAllBadges: () => api.get("/badge/all").then((res) => res.data),

  searchBadges: (params) =>
    api.get("/badge/search", { params }).then((res) => res.data),
};

// ================= 14. ANALYTICS SERVICE ================= //
export const analyticsService = {
  getAnalytics: () => api.get("/analytics").then((res) => res.data),

  updateAnalytics: (analyticsData) =>
    api.put("/analytics/update", analyticsData).then((res) => res.data),

  getMonthlyUserGrowth: () =>
    api.get("/analytics/monthly-users").then((res) => res.data),

  getMonthlyDonations: () =>
    api.get("/analytics/monthly-donations").then((res) => res.data),

  cleaningRequestStatusAnalytics: () =>
    api.get("/analytics/cleaning-status").then((res) => res.data),

  topDonatingUsers: () =>
    api.get("/analytics/top-donors").then((res) => res.data),

  campaignAnalytics: () =>
    api.get("/analytics/campaigns").then((res) => res.data),
};

// ================= 15. PAYMENT SERVICE ================= //
export const paymentService = {
  createDonationOrder: (amount) =>
    api.post("/payment/donate/order", { amount }).then((res) => res.data),

  // 2. Cryptographically verify the payment signature
  verifyDonation: (verificationData) =>
    api
      .post("/payment/donate/verify", verificationData)
      .then((res) => res.data),
  createEliteBadgePayment: (paymentData) =>
    api.post("/payment/ngo-elite", paymentData).then((res) => res.data),

  hireCleaningCompanyPayment: (paymentData) =>
    api
      .post("/payment/hire-cleaning-company", paymentData)
      .then((res) => res.data),

  companySubscriptionPayment: (paymentData) =>
    api
      .post("/payment/company-subscription", paymentData)
      .then((res) => res.data),

  verifyPayment: (verificationData) =>
    api.post("/payment/verify", verificationData).then((res) => res.data),

  getAllPayments: () => api.get("/payment").then((res) => res.data),

  getSinglePayment: (paymentId) =>
    api.get(`/payment/${paymentId}`).then((res) => res.data),
};

// ================= 16. AI BOX SERVICE ================= //
export const aiBoxService = {
  summarizeNGODescription: (descriptionData) =>
    api
      .post("/aiChatBoxRoute/summarize-ngo-description", descriptionData)
      .then((res) => res.data),
};

// ----- VOLUNTEER SERVICE ----- //
export const volunteerService = {
  applyForCampaign: async (campaignId, formData) => {
    // Pass formData as the payload body to axios
    const response = await api.post(`/campaign/apply/${campaignId}`, formData);
    return response.data;
  },

  getAllRequests: async () => {
    // Matches your backend route
    const response = await api.get("/campaign/all-requests");
    return response.data;
  },

  approveVolunteer: async (requestId) => {
    const response = await api.put(`/campaign/approve/${requestId}`);
    return response.data;
  },

  rejectVolunteer: async (requestId) => {
    const response = await api.put(`/campaign/reject/${requestId}`);
    return response.data;
  },
};

// ================= 17. NOTIFICATION SERVICE ================= //
export const notificationService = {
  getMyNotifications: () => api.get("/notification/my").then((res) => res.data),

  markAsRead: (notificationId) =>
    api.put(`/notification/read/${notificationId}`).then((res) => res.data),

  deleteNotification: (notificationId) =>
    api
      .delete(`/notification/delete/${notificationId}`)
      .then((res) => res.data),

  getAllNotifications: () =>
    api.get("/notification/all").then((res) => res.data),
};

export default api;

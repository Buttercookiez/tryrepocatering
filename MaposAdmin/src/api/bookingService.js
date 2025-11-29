import api from './api';

// ==========================================
// 1. GET BOOKING
// ==========================================
export const getBookingByRefId = async (refId) => {
  try {
    const response = await api.get(`/inquiries/${refId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching booking ${refId}:`, error);
    throw error;
  }
}; 
// <--- IMPORTANT: This bracket closes getBookingByRefId

// ==========================================
// 2. SEND PROPOSAL
// ==========================================
export const sendProposalEmail = async (payload) => {
  try {
    const response = await api.post(`/inquiries/send-proposal`, payload);
    return response.data;
  } catch (error) {
    console.error("Error sending proposal email:", error);
    throw error;
  }
}; 
// <--- IMPORTANT: This bracket closes sendProposalEmail

// ==========================================
// 3. DECLINE INQUIRY (Must be outside the others)
// ==========================================
export const declineInquiry = async (payload) => {
  try {
    const response = await api.post(`/inquiries/decline`, payload);
    return response.data;
  } catch (error) {
    console.error("Error declining inquiry:", error);
    throw error;
  }
};
// <--- IMPORTANT: This bracket closes declineInquiry

// 4. Send Final Quotation
export const sendFinalQuotation = async (payload) => {
  try {
    const response = await api.post(`/inquiries/send-quotation`, payload);
    return response.data;
  } catch (error) {
    console.error("Error sending quotation:", error);
    throw error;
  }
};

// 5. Client Accepts Proposal
export const acceptProposal = async (payload) => {
  try {
    const response = await api.post(`/inquiries/accept-proposal`, payload);
    return response.data;
  } catch (error) {
    console.error("Error accepting proposal:", error);
    throw error;
  }
};
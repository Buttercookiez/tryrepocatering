import api from './api'; // Your axios instance

// 1. Fetch Booking
export const getBookingByRefId = async (refId) => {
  try {
    const response = await api.get(`/inquiries/${refId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching booking ${refId}:`, error);
    throw error;
  } 
};

// 2. Send Initial Proposal
export const sendProposalEmail = async (payload) => {
  try {
    const response = await api.post(`/inquiries/send-proposal`, payload);
    return response.data;
  } catch (error) {
    console.error("Error sending proposal email:", error);
    throw error;
  }
};

// 3. Send Final Quotation (Contract)
export const sendFinalQuotation = async (payload) => {
  try {
    const response = await api.post(`/inquiries/send-quotation`, payload);
    return response.data;
  } catch (error) {
    console.error("Error sending quotation:", error);
    throw error;
  }
};

// 4. Decline Inquiry
export const declineInquiry = async (payload) => {
  try {
    const response = await api.post(`/inquiries/decline`, payload);
    return response.data;
  } catch (error) {
    console.error("Error declining inquiry:", error);
    throw error;
  }
};

// 5. ✅ Client Accepts Proposal (This was missing!)
export const acceptProposal = async (payload) => {
  try {
    const response = await api.post(`/inquiries/accept-proposal`, payload);
    return response.data;
  } catch (error) {
    console.error("Error accepting proposal:", error);
    throw error;
  }
};
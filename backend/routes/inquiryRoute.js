const express = require('express');
const router = express.Router();
const { 
    createInquiry, 
    getInquiryDetails, 
    getBooking, 
    sendProposalEmail,
    sendFinalQuotation,
    declineInquiry,
    acceptProposal
} = require('../controllers/inquiryController');

// Define Routes
router.post('/', createInquiry);
router.get('/', getBooking);
router.get('/:refId', getInquiryDetails);
router.post('/send-proposal', sendProposalEmail);
router.post('/send-quotation', sendFinalQuotation); // New Step 4 Route
router.post('/decline', declineInquiry);
router.post('/accept-proposal', acceptProposal); // <--- Add Route

module.exports = router;
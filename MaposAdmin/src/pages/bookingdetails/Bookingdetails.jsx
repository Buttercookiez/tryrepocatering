import React, { useState, useEffect } from "react";
import { 
    getBookingByRefId, 
    sendProposalEmail, 
    sendFinalQuotation, 
    declineInquiry 
} from "../../api/bookingService"; 
import {
  ArrowLeft, Calendar, Users, Mail, Phone, Send, MoreHorizontal, 
  ChefHat, Loader2, XCircle, AlertTriangle
} from "lucide-react";

// Imports from your file structure
import { FadeIn, renderStatusBadge, REJECTION_REASONS } from "./components/BookingHelpers";
import EventInfoTab from "./tabs/EventInfoTab";
import PaymentsTab from "./tabs/PaymentsTab";
import ProposalTab from "./tabs/ProposalTab";
import ContractTab from "./tabs/ContractTab";
import NotesTab from "./tabs/NotesTab";

const BookingDetails = ({
  booking, onBack, activeDetailTab, setActiveDetailTab, onUpdate, theme: propTheme, darkMode,
}) => {
  // Theme Fallback
  const theme = propTheme || {
    bg: darkMode ? "bg-[#0c0c0c]" : "bg-[#FAFAFA]",
    cardBg: darkMode ? "bg-[#111]" : "bg-white",
    text: darkMode ? "text-stone-200" : "text-stone-900",
    subText: darkMode ? "text-stone-400" : "text-stone-500",
    border: darkMode ? "border-stone-800" : "border-stone-200",
    hoverBg: darkMode ? "hover:bg-stone-800" : "hover:bg-stone-50",
  };

  const detailTabs = ["Event Info", "Payments", "Proposal", "Contract", "Notes"];

  // State
  const [bookingData, setBookingData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [pricePerHead, setPricePerHead] = useState(0);
  const [proposalTotal, setProposalTotal] = useState(0);
  const [downpaymentAmount, setDownpaymentAmount] = useState(0); 
  const [paymentTerms, setPaymentTerms] = useState("50% Downpayment due immediately. Remaining balance due 1 week before event.");
  
  // ✅ FIX: Added missing state variable
  const [generatedLink, setGeneratedLink] = useState(null); 

  const [clientAcceptedOverride, setClientAcceptedOverride] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [emailStatus, setEmailStatus] = useState(null); 
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [customReason, setCustomReason] = useState("");

  // 1. Fetch Data
  useEffect(() => {
    const fetchBookingDetails = async () => {
      const idToFetch = booking?.refId || booking?.id;
      if (!idToFetch) return;
      setIsLoading(true);
      try {
        const data = await getBookingByRefId(idToFetch);
        setBookingData(data);
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Could not sync with database. Showing list data.");
        setBookingData(booking);
      } finally { setIsLoading(false); }
    };
    fetchBookingDetails();
  }, [booking]);

  // 2. Proposal Calculation
  useEffect(() => {
    if (bookingData) {
        const existingTotal = bookingData.proposal?.costBreakdown?.grandTotal;
        const estimated = bookingData.estimatedBudget;
        let currentTotal = existingTotal || estimated || 0;
        setProposalTotal(currentTotal);
        setPricePerHead(currentTotal / (bookingData.estimatedGuests || 1));
        
        const grandTotal = currentTotal * 1.1; 
        if (bookingData.payment?.downpayment) setDownpaymentAmount(bookingData.payment.downpayment);
        else setDownpaymentAmount(grandTotal * 0.5);
    }
  }, [bookingData]);

  const handlePriceChange = (e) => {
      const val = parseFloat(e.target.value) || 0;
      setPricePerHead(val);
      const newTotal = val * (bookingData?.estimatedGuests || 0);
      setProposalTotal(newTotal);
      setDownpaymentAmount((newTotal * 1.1) * 0.5);
  };

  // --- HTML EMAIL GENERATOR ---
  const generateHtmlEmail = (link, clientName, financials, eventDetails) => {
    return `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f9f9f9; padding: 40px 0;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 4px; overflow: hidden;">
            <div style="background-color: #1c1c1c; padding: 30px; text-align: center;">
                <h1 style="color: #C9A25D; margin: 0; font-family: 'Georgia', serif; letter-spacing: 2px; font-size: 24px;">OFFICIAL QUOTATION</h1>
                <p style="color: #888; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; margin-top: 5px;">Reference ID: ${eventDetails.id}</p>
            </div>
            <div style="padding: 40px;">
                <p style="color: #333; font-size: 16px;">Dear <strong>${clientName}</strong>,</p>
                <p style="color: #555; line-height: 1.6;">We are pleased to send you the final contract and quotation for your upcoming event. Please click the button below to review, sign, and proceed with payment.</p>
                <div style="background-color: #f5f5f5; padding: 20px; border-radius: 4px; margin: 20px 0;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                            <td style="padding-bottom: 8px; color: #888; font-size: 11px; text-transform: uppercase;">Event Date</td>
                            <td style="padding-bottom: 8px; color: #888; font-size: 11px; text-transform: uppercase;">Guests</td>
                        </tr>
                        <tr>
                            <td style="font-size: 14px; color: #333; font-weight: bold;">${eventDetails.date}</td>
                            <td style="font-size: 14px; color: #333; font-weight: bold;">${eventDetails.guests} Pax</td>
                        </tr>
                    </table>
                </div>
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 30px;">
                    <tr>
                        <td style="padding: 10px 0; border-bottom: 1px dashed #ddd; color: #555;">Downpayment Required</td>
                        <td style="padding: 10px 0; border-bottom: 1px dashed #ddd; text-align: right; color: #333; font-weight: bold;">₱ ${financials.downpayment.toLocaleString()}</td>
                    </tr>
                    <tr>
                        <td style="padding: 15px 0; font-size: 16px; font-weight: bold; color: #C9A25D;">Grand Total</td>
                        <td style="padding: 15px 0; font-size: 20px; font-weight: bold; text-align: right; color: #C9A25D; font-family: 'Georgia', serif;">₱ ${financials.grandTotal.toLocaleString()}</td>
                    </tr>
                </table>
                <div style="text-align: center; margin-top: 30px;">
                    <a href="${link}" style="background-color: #C9A25D; color: #ffffff; padding: 15px 35px; text-decoration: none; font-size: 14px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; border-radius: 2px; display: inline-block;">
                        Review & Sign Contract
                    </a>
                </div>
            </div>
        </div>
      </div>
    `;
  };

  // --- ACTION: SEND FINAL CONTRACT ---
  const handleSendFinalQuotation = async () => {
      if (!details.email) return alert("No email found.");
      setIsSending(true);
      setEmailStatus(null);

      // 1. Calculate Financials
      const grandTotal = proposalTotal * 1.1;
      const balance = grandTotal - downpaymentAmount;

      // 2. GENERATE LINK (Forcing localhost:3000)
      const baseUrl = "http://localhost:3000"; 
      const contractLink = `${baseUrl}/client-payment/${details.id}`;
      
      // Update state so the UI shows the link
      setGeneratedLink(contractLink); 

      // 3. Generate HTML Body
      const htmlBody = generateHtmlEmail(
          contractLink, 
          details.client, 
          { grandTotal, downpayment: downpaymentAmount, balance },
          { id: details.id, date: details.date, guests: details.guests }
      );

      try {
          await sendFinalQuotation({
              refId: details.id, 
              clientName: details.client, 
              clientEmail: details.email,
              financials: { 
                  grandTotal, 
                  reservationFee: 0, 
                  downpayment: downpaymentAmount, 
                  balance 
              },
              paymentTerms, 
              paymentLink: contractLink, 
              htmlContent: htmlBody,      
              eventSummary: { date: details.date, venue: details.venue, guests: details.guests }
          });

          setEmailStatus("quoted");
          setBookingData(prev => ({...prev, status: "Contract Sent"}));
          if (onUpdate) onUpdate();
          setTimeout(() => setEmailStatus(null), 3000);
      } catch (err) { 
          console.error("Error sending contract:", err);
          alert("Failed to send quotation."); 
      } finally { 
          setIsSending(false); 
      }
  };

  const handleSendProposal = async () => {
    if (!details.email) return alert("No email address.");
    setIsSending(true);
    setEmailStatus(null);
    const menuCost = proposalTotal;
    const serviceCharge = menuCost * 0.1;

    try {
      await sendProposalEmail({
          refId: details.id, clientName: details.client, clientEmail: details.email,
          totalCost: menuCost + serviceCharge, breakdown: { menuPrice: menuCost, serviceCharge },
          details: { date: details.date, guests: details.guests, venue: details.venue, serviceStyle: details.serviceStyle }
      });
      setEmailStatus("success");
      setBookingData(prev => ({...prev, status: "For Approval"}));
      if (onUpdate) onUpdate();
      setTimeout(() => setEmailStatus(null), 3000); 
    } catch (err) { console.error(err); setEmailStatus("error"); } finally { setIsSending(false); }
  };

  const handleDeclineSubmit = async () => {
      if (!rejectionReason) return alert("Please select a reason.");
      setIsSending(true);
      try {
          await declineInquiry({ refId: details.id, email: details.email, reason: rejectionReason === "Other" ? customReason : rejectionReason });
          setShowDeclineModal(false);
          setEmailStatus("declined");
          setBookingData(prev => ({...prev, status: "Declined"}));
          if (onUpdate) onUpdate();
      } catch (err) { alert("Failed to decline."); } finally { setIsSending(false); }
  };

  if (!booking && !bookingData) return <div className={`flex-1 h-full flex items-center justify-center ${theme.bg}`}><Loader2 className="animate-spin text-[#C9A25D]" size={30} /></div>;

  const currentData = bookingData || {};
  const paymentData = currentData.payment || {};
  const notesData = currentData.notes || {};

  const details = {
    id: currentData.refId || currentData.id || "N/A",
    client: currentData.fullName || currentData.client || "Unknown",
    phone: currentData.phone || "No Info",
    email: currentData.email || "No Email",
    date: currentData.dateOfEvent || currentData.date || "TBD",
    guests: currentData.estimatedGuests || currentData.guests || 0,
    type: currentData.eventType || currentData.type || "Event",
    venue: currentData.venueName || currentData.venue || "TBD", 
    timeStart: currentData.startTime || "TBD",
    timeEnd: currentData.endTime || "TBD",
    serviceStyle: currentData.serviceStyle || "Plated",
    dietary: currentData.initialNotes || "None",
    notes: currentData.initialNotes || "No notes.",
    status: currentData.status || "Pending",
    budget: currentData.estimatedBudget || 0,
    reservationFee: paymentData.reservationFee || 5000,
    downpayment: paymentData.downpayment || 0,
    balance: paymentData.balance || currentData.estimatedBudget || 0,
    downpaymentStatus: paymentData.downpayment ? "Paid" : "Unpaid",
    timeline: notesData.timeline || [{ date: "N/A", user: "System", action: "No activity." }],
  };

  return (
    <div className={`flex-1 overflow-y-auto scroll-smooth no-scrollbar h-full flex flex-col ${theme.bg} relative`}>
      <style>{`input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; } input[type=number] { -moz-appearance: textfield; }`}</style>
      
      {/* Decline Modal */}
      {showDeclineModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className={`w-full max-w-md ${theme.cardBg} rounded-lg shadow-2xl border ${theme.border} p-6 animate-in fade-in zoom-in duration-300`}>
                  <div className="flex justify-between items-center mb-6"><h3 className={`font-serif text-xl ${theme.text} flex items-center gap-2`}><AlertTriangle className="text-red-500" size={20} /> Decline Inquiry</h3><button onClick={() => setShowDeclineModal(false)}><XCircle size={20} className="text-stone-400 hover:text-red-500"/></button></div>
                  <div className="space-y-3 mb-6">{REJECTION_REASONS.map((reason) => (<label key={reason} className={`flex items-center gap-3 p-3 border rounded-sm cursor-pointer transition-all ${rejectionReason === reason ? "border-red-500 bg-red-50 text-red-900" : `${theme.border} ${theme.text}`}`}><input type="radio" name="rejection" value={reason} checked={rejectionReason === reason} onChange={(e) => setRejectionReason(e.target.value)} className="accent-red-500"/><span className="text-sm font-medium">{reason}</span></label>))}</div>
                  {rejectionReason === "Other" && <textarea className={`w-full p-3 border ${theme.border} ${theme.text} bg-transparent rounded-sm text-sm mb-6`} placeholder="Specify reason..." value={customReason} onChange={(e) => setCustomReason(e.target.value)}></textarea>}
                  <div className="flex gap-3 justify-end"><button onClick={() => setShowDeclineModal(false)} className={`px-4 py-2 text-xs uppercase font-bold text-stone-500`}>Cancel</button><button onClick={handleDeclineSubmit} disabled={isSending} className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white text-xs uppercase font-bold rounded-sm flex items-center gap-2">{isSending ? <Loader2 className="animate-spin" size={14} /> : "Confirm"}</button></div>
              </div>
          </div>
      )}

      {/* Header */}
      <div className={`h-16 flex items-center justify-between px-6 md:px-8 border-b ${theme.border} ${theme.cardBg} sticky top-0 z-20`}>
        <div className="flex items-center gap-4">
          <button onClick={onBack} className={`p-2 hover:text-[#C9A25D] rounded-full transition-colors ${theme.subText}`}><ArrowLeft size={18} /></button>
          <div className="h-6 w-[1px] bg-stone-200 dark:bg-stone-800 mx-2"></div>
          <div><div className="flex items-center gap-3"><h2 className={`font-serif text-xl ${theme.text}`}>{details.client}</h2><span className={`text-xs font-mono ${theme.subText}`}>{details.id}</span></div></div>
        </div>
        <div className="flex gap-3 items-center">{renderStatusBadge(details.status)}<button className={`p-2 hover:text-[#C9A25D] transition-colors ${theme.subText}`}><MoreHorizontal size={18} /></button></div>
      </div>
      {error && <div className="bg-red-500/10 border-b border-red-500/20 p-2 text-center text-xs text-red-500">Warning: {error}</div>}

      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className={`w-full lg:w-80 border-r ${theme.border} ${theme.cardBg} p-6 lg:p-8 overflow-y-auto scroll-smooth no-scrollbar z-10`}>
          <h3 className={`text-[10px] uppercase tracking-[0.2em] mb-6 ${theme.subText} font-bold`}>Customer Profile</h3>
          <div className={`flex flex-col items-center text-center mb-8 pb-8 border-b border-dashed ${theme.border}`}>
            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-[#C9A25D] text-xl font-serif italic mb-3 border ${theme.border} bg-transparent`}>{details.client.charAt(0)}</div>
            <h4 className={`font-serif text-xl mb-1 ${theme.text}`}>{details.client}</h4>
            <div className={`flex gap-3 mt-3 justify-center`}><button className={`p-2 rounded-full border ${theme.border} text-stone-400 hover:border-[#C9A25D]`}><Mail size={14} /></button><button className={`p-2 rounded-full border ${theme.border} text-stone-400 hover:border-[#C9A25D]`}><Phone size={14} /></button></div>
          </div>
          <div className="space-y-6">
            <div className="flex items-start gap-3"><Calendar size={16} className="mt-0.5 text-[#C9A25D]" /><div><p className="text-[10px] uppercase tracking-widest text-stone-400">Event Date</p><p className={`text-sm font-medium ${theme.text}`}>{details.date}</p></div></div>
            <div className="flex items-start gap-3"><ChefHat size={16} className="mt-0.5 text-[#C9A25D]" /><div><p className="text-[10px] uppercase tracking-widest text-stone-400">Occasion</p><p className={`text-sm font-medium ${theme.text}`}>{details.type}</p></div></div>
            <div className="flex items-start gap-3"><Users size={16} className="mt-0.5 text-[#C9A25D]" /><div><p className="text-[10px] uppercase tracking-widest text-stone-400">Headcount</p><p className={`text-sm font-medium ${theme.text}`}>{details.guests} Pax</p></div></div>
            <div className={`p-4 rounded-sm border ${theme.border} bg-transparent`}><p className="text-[10px] uppercase tracking-widest text-stone-400 mb-2">Customer Notes</p><p className={`text-xs italic ${theme.subText}`}>"{details.notes}"</p></div>
          </div>
        </div>

        {/* Tabs Area */}
        <div className={`flex-1 flex flex-col ${theme.bg}`}>
          <div className={`flex items-center border-b ${theme.border} ${theme.cardBg} px-6`}>
            {detailTabs.map((tab) => (
              <button key={tab} onClick={() => setActiveDetailTab(tab)} className={`px-6 py-4 text-xs uppercase tracking-[0.2em] border-b-2 transition-colors font-medium ${activeDetailTab === tab ? "border-[#C9A25D] text-[#C9A25D]" : `border-transparent ${theme.subText} hover:text-stone-600 dark:hover:text-stone-300`}`}>{tab}</button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto p-8 lg:p-12 no-scrollbar">
            <FadeIn key={activeDetailTab}>
              {activeDetailTab === "Event Info" && <EventInfoTab details={details} theme={theme} />}
              {activeDetailTab === "Payments" && <PaymentsTab details={details} theme={theme} darkMode={darkMode} />}
              {activeDetailTab === "Proposal" && <ProposalTab details={details} theme={theme} proposalTotal={proposalTotal} pricePerHead={pricePerHead} handlePriceChange={handlePriceChange} handleSendProposal={handleSendProposal} isSending={isSending} emailStatus={emailStatus} setShowDeclineModal={setShowDeclineModal} />}
              {activeDetailTab === "Contract" && <ContractTab details={details} theme={theme} darkMode={darkMode} bookingData={bookingData} proposalTotal={proposalTotal} downpaymentAmount={downpaymentAmount} setDownpaymentAmount={setDownpaymentAmount} paymentTerms={paymentTerms} setPaymentTerms={setPaymentTerms} clientAcceptedOverride={clientAcceptedOverride} setClientAcceptedOverride={setClientAcceptedOverride} handleSendFinalQuotation={handleSendFinalQuotation} isSending={isSending} emailStatus={emailStatus} />}
              {activeDetailTab === "Notes" && <NotesTab details={details} theme={theme} />}
            </FadeIn>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;
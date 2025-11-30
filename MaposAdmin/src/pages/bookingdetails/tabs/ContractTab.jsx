import React from 'react';
import { Lock, FileSignature, Loader2, CheckCircle, Calculator, Check, Eye, DollarSign, FileText } from "lucide-react";
import { renderStatusBadge } from "../components/BookingHelpers";
import QuotationPreviewCard from "../components/QuotationPreviewCard";

const ContractTab = ({ 
    details, theme, darkMode, bookingData,
    proposalTotal, downpaymentAmount, setDownpaymentAmount, 
    paymentTerms, setPaymentTerms, clientAcceptedOverride, setClientAcceptedOverride, 
    handleSendFinalQuotation, isSending, emailStatus 
}) => {
  
  // 1. LOGIC: Check Unlock Status
  const isUnlocked = 
    details.status === "Proposal Accepted" || 
    details.status === "Contract Sent" || 
    details.status === "Confirmed" || 
    clientAcceptedOverride;

  // 2. LOGIC: Data Prep
  const proposalData = bookingData?.proposal || {};
  const isApproved = proposalData.isApproved;

  const displayPackageId = isApproved 
      ? proposalData.clientSelectedPackage 
      : (proposalData.selectedPackageId || 'premium');

  const displayAddOns = isApproved 
      ? proposalData.clientSelectedAddOns 
      : (proposalData.addOns || []);

  // 3. LOGIC: Financials
  const calculatedGrandTotal = isApproved ? proposalTotal : (proposalTotal * 1.1);
  const calculatedBalance = calculatedGrandTotal - downpaymentAmount;

  return (
    <div className="max-w-full mx-auto h-full flex flex-col justify-center animate-in fade-in duration-300">
      
      {!isUnlocked ? (
          // --- LOCKED STATE (Clean Empty State) ---
          <div className={`flex flex-col items-center justify-center text-center py-24 px-8 border ${theme.border} ${theme.cardBg} rounded-sm`}>
              {/* UPDATED: Transparent background */}
              <div className="p-4 rounded-full bg-transparent border border-stone-200 dark:border-stone-800 mb-6 text-stone-400">
                  <Lock size={32} />
              </div>
              <h3 className={`font-serif text-2xl ${theme.text} mb-2`}>Contract Generation Locked</h3>
              <p className={`text-sm ${theme.subText} max-w-md mb-8 leading-relaxed`}>
                  The contract tools are disabled until the client accepts the initial proposal. You can manually override this if you have received offline acceptance.
              </p>
              <button 
                onClick={() => setClientAcceptedOverride(true)} 
                className="text-xs uppercase tracking-widest text-[#C9A25D] border border-[#C9A25D] px-8 py-3 rounded-sm hover:bg-[#C9A25D] hover:text-white transition-all shadow-sm flex items-center gap-2 font-bold"
              >
                  <Lock size={12}/> Admin Override
              </button>
          </div>
      ) : (
          // --- UNLOCKED STATE (Grid Layout) ---
          <div>
              {/* PAGE HEADER */}
              <div className="flex justify-between items-center mb-8">
                <div>
                    <h3 className={`font-serif text-2xl ${theme.text}`}>Contract & Payment</h3>
                    <p className={`text-xs ${theme.subText} mt-1`}>Ref No. {details.id}-CTR</p>
                </div>
                <div className="text-right">
                    {renderStatusBadge(details.status)}
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  
                  {/* --- LEFT COLUMN: CONFIGURATION CARD --- */}
                  <div className="space-y-6">
                      <div className={`border ${theme.border} ${theme.cardBg} p-8 rounded-sm`}>
                          <h4 className={`text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2 ${theme.text}`}>
                              <FileSignature size={16} className="text-[#C9A25D]"/> Payment Configuration
                          </h4>
                          
                          <div className="space-y-6">
                              {/* 1. Grand Total Display */}
                              {/* UPDATED: bg-transparent to remove white/gray box */}
                              <div className={`p-5 rounded-sm bg-transparent border ${theme.border} flex justify-between items-center`}>
                                <div className="flex flex-col">
                                  <span className={`text-[10px] uppercase tracking-widest font-bold ${theme.subText}`}>Grand Total</span>
                                  <span className="text-[10px] text-stone-400">
                                      {isApproved ? "Client Agreed Amount" : "Incl. 10% Service Charge"}
                                  </span>
                                </div>
                                <span className="font-serif text-2xl text-[#C9A25D]">₱ {calculatedGrandTotal.toLocaleString()}</span>
                              </div>

                              {/* 2. Downpayment Input */}
                              <div>
                                  <label className={`text-[10px] uppercase tracking-widest ${theme.subText} block mb-2 font-bold`}>Required Downpayment</label>
                                  {/* UPDATED: bg-transparent */}
                                  <div className={`flex items-center border ${theme.border} rounded-sm px-4 py-3 focus-within:border-[#C9A25D] transition-colors bg-transparent`}>
                                      <span className="text-stone-400 mr-3 text-sm">₱</span>
                                      <input 
                                        type="number" 
                                        value={downpaymentAmount} 
                                        onChange={(e) => setDownpaymentAmount(parseFloat(e.target.value) || 0)} 
                                        className={`bg-transparent w-full focus:outline-none font-medium text-lg ${theme.text} no-spinner font-serif`}
                                        placeholder="0.00"
                                      />
                                  </div>
                                  <div className="flex justify-between mt-2 px-1">
                                      <span className="text-[10px] text-stone-400 italic">Remaining Balance</span>
                                      <span className={`text-xs font-bold ${theme.text}`}>₱ {calculatedBalance.toLocaleString()}</span>
                                  </div>
                              </div>

                              {/* 3. Payment Terms */}
                              <div>
                                  <label className={`text-[10px] uppercase tracking-widest ${theme.subText} block mb-2 font-bold`}>Terms & Conditions</label>
                                  <div className={`relative`}>
                                    {/* UPDATED: bg-transparent */}
                                    <textarea 
                                        rows="6" 
                                        value={paymentTerms} 
                                        onChange={(e) => setPaymentTerms(e.target.value)} 
                                        className={`w-full bg-transparent border ${theme.border} rounded-sm p-4 text-sm focus:border-[#C9A25D] outline-none ${theme.text} leading-relaxed resize-none`}
                                    ></textarea>
                                    <FileText size={14} className="absolute top-4 right-4 text-stone-300 pointer-events-none"/>
                                  </div>
                              </div>
                          </div>
                      </div>

                      {/* ACTION BUTTON AREA */}
                      <div className={`border-t border-stone-100 dark:border-stone-800 pt-6`}>
                        <button 
                            onClick={handleSendFinalQuotation} 
                            disabled={isSending || emailStatus === 'quoted'} 
                            className={`w-full flex items-center justify-center gap-3 px-8 py-4 rounded-sm text-sm uppercase tracking-[0.15em] font-bold transition-all duration-300 shadow-md hover:shadow-lg
                                ${emailStatus === 'quoted' 
                                ? "bg-emerald-600 text-white cursor-default" 
                                : "bg-[#C9A25D] text-white hover:bg-[#b08d55]"} 
                                disabled:opacity-70 disabled:cursor-not-allowed`}
                        >
                            {isSending ? (
                                <><Loader2 size={16} className="animate-spin" /> Processing Contract...</>
                            ) : emailStatus === 'quoted' ? (
                                <><CheckCircle size={16} /> Sent Successfully</>
                            ) : (
                                <><Calculator size={16} /> Generate & Send Contract</>
                            )}
                        </button>
                        
                        {emailStatus === 'quoted' && (
                            <p className="text-center text-emerald-500 text-xs mt-3 flex items-center justify-center gap-1 animate-in fade-in">
                                <Check size={12}/> Secure Payment Link has been emailed.
                            </p>
                        )}
                        {!emailStatus && !isSending && (
                            <p className="text-center text-[10px] text-stone-400 mt-3">
                                Action will email a secure payment link to <span className={theme.text}>{details.email}</span>
                            </p>
                        )}
                      </div>
                  </div>

                  {/* --- RIGHT COLUMN: PREVIEW --- */}
                  <div className="flex flex-col h-full">
                     <div className="mb-4 flex items-center justify-between">
                         <h4 className={`text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${theme.text}`}>
                              <Eye size={16} className="text-[#C9A25D]"/> Client View Simulation
                          </h4>
                         <span className="text-[9px] uppercase tracking-widest text-stone-400 font-bold border border-stone-200 dark:border-stone-800 px-2 py-1 rounded">Live Render</span>
                     </div>
                     
                     <div className="flex-1">
                        <QuotationPreviewCard 
                            booking={{
                                ...details, 
                                selectedPackageId: displayPackageId,
                                addOns: displayAddOns
                            }}
                            financials={{
                                grandTotal: calculatedGrandTotal, 
                                downpayment: downpaymentAmount, 
                                balance: calculatedBalance
                            }}
                            theme={theme}
                            darkMode={darkMode}
                        />
                     </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default ContractTab;
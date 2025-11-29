import React from 'react';
import { Lock, FileSignature, Loader2, CheckCircle, Calculator, Check, Eye } from "lucide-react";
import { renderStatusBadge } from "../components/BookingHelpers";
import QuotationPreviewCard from "../components/QuotationPreviewCard";

const ContractTab = ({ 
    details, theme, darkMode, bookingData,
    proposalTotal, downpaymentAmount, setDownpaymentAmount, 
    paymentTerms, setPaymentTerms, clientAcceptedOverride, setClientAcceptedOverride, 
    handleSendFinalQuotation, isSending, emailStatus 
}) => {
  
  // Logic to unlock the screen
  const isUnlocked = details.status === "Proposal Accepted" || details.status === "For Approval" || clientAcceptedOverride;

  return (
    <div className="max-w-full mx-auto h-full flex flex-col justify-center animate-in fade-in duration-300">
      
      {!isUnlocked ? (
          // --- LOCKED STATE VIEW ---
          <div className={`flex flex-col items-center justify-center text-center p-20 border border-dashed ${theme.border} rounded-lg bg-transparent`}>
              <div className="w-20 h-20 rounded-full border border-stone-200 dark:border-stone-700 flex items-center justify-center mb-6 shadow-sm">
                  <Lock className="text-stone-400" size={30} />
              </div>
              <h3 className={`font-serif text-3xl ${theme.text} mb-2`}>Awaiting Client Acceptance</h3>
              <p className={`text-sm ${theme.subText} max-w-md mb-8`}>
                  The official contract generator is locked. It will automatically unlock once the client has reviewed and accepted the initial proposal.
              </p>
              <button 
                onClick={() => setClientAcceptedOverride(true)} 
                className="text-xs uppercase tracking-widest text-[#C9A25D] border border-[#C9A25D] px-8 py-3 rounded-sm hover:bg-[#C9A25D] hover:text-white transition-all shadow-sm flex items-center gap-2"
              >
                  <Lock size={12}/> Force Unlock (Admin Override)
              </button>
          </div>
      ) : (
          // --- UNLOCKED STATE VIEW ---
          <div>
              {/* HEADER */}
              <div className="flex flex-col md:flex-row justify-between items-end border-b border-stone-200 dark:border-stone-800 pb-6 mb-10">
                <div>
                    <h3 className={`font-serif text-3xl ${theme.text}`}>Contract & Payment</h3>
                    <p className={`text-sm ${theme.subText} mt-1`}>Configure payment terms and preview the official quotation before sending.</p>
                </div>
                <div className="text-right mt-4 md:mt-0">
                    <span className="block text-[10px] uppercase text-stone-400 font-bold mb-1">Current Status</span>
                    {renderStatusBadge(details.status)}
                </div>
              </div>

              {/* TWO COLUMN LAYOUT */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                  
                  {/* --- LEFT COLUMN: CONTROLS --- */}
                  <div className="flex flex-col gap-6">
                      <div className={`p-8 border ${theme.border} rounded-sm shadow-sm relative overflow-hidden bg-transparent`}>
                          
                          <h4 className={`text-xs uppercase font-bold ${theme.subText} mb-8 pb-2 border-b border-dashed border-stone-200 dark:border-stone-700 flex items-center gap-2`}>
                              <FileSignature size={14} className="text-[#C9A25D]"/> Contract Configuration
                          </h4>
                          
                          <div className={`space-y-8`}>
                              {/* TOTAL DISPLAY */}
                              <div className={`p-6 border border-stone-200 dark:border-stone-700 rounded-sm flex justify-between items-center bg-transparent`}>
                                <div className="flex flex-col">
                                  <span className={`font-bold ${theme.text} text-sm`}>Contract Grand Total</span>
                                  <span className="text-[10px] text-stone-500">Based on proposal + 10% Service Charge</span>
                                </div>
                                <span className="font-serif text-2xl text-[#C9A25D]">₱ {(proposalTotal * 1.1).toLocaleString()}</span>
                              </div>

                              {/* INPUTS (Clean White/Transparent) */}
                              <div>
                                  <label className={`text-[10px] uppercase tracking-widest ${theme.subText} block mb-2 font-bold`}>Required Downpayment (50%)</label>
                                  <div className={`flex items-center border ${theme.border} rounded-sm px-4 py-3 focus-within:border-[#C9A25D] transition-colors`}>
                                      <span className="text-stone-500 mr-3 font-serif text-lg">₱</span>
                                      <input 
                                        type="number" 
                                        value={downpaymentAmount} 
                                        onChange={(e) => setDownpaymentAmount(parseFloat(e.target.value) || 0)} 
                                        className={`bg-transparent w-full focus:outline-none font-medium text-lg ${theme.text} no-spinner`}
                                      />
                                  </div>
                                  <div className="flex justify-between mt-2 text-[10px] text-stone-400">
                                      <span>Remaining Balance:</span>
                                      <span className={theme.text}>₱ {((proposalTotal * 1.1) - downpaymentAmount).toLocaleString()}</span>
                                  </div>
                              </div>

                              <div>
                                  <label className={`text-[10px] uppercase tracking-widest ${theme.subText} block mb-2 font-bold`}>Legal Payment Terms</label>
                                  <textarea 
                                    rows="5" 
                                    value={paymentTerms} 
                                    onChange={(e) => setPaymentTerms(e.target.value)} 
                                    className={`w-full bg-transparent border ${theme.border} rounded-sm p-4 text-sm focus:border-[#C9A25D] outline-none ${theme.text} shadow-none leading-relaxed resize-none`}
                                  ></textarea>
                              </div>
                          </div>
                      </div>

                      {/* ACTION BUTTON */}
                      <div>
                        <button 
                            onClick={handleSendFinalQuotation} 
                            disabled={isSending || emailStatus === 'quoted'} 
                            className={`w-full flex items-center justify-center gap-3 px-8 py-5 rounded-sm text-sm uppercase tracking-[0.2em] font-bold transition-all duration-300 shadow-lg 
                                ${emailStatus === 'quoted' 
                                ? "bg-emerald-600 text-white cursor-default border border-emerald-600" 
                                : "bg-[#C9A25D] text-white hover:bg-[#b08d55] border border-[#C9A25D]"} 
                                disabled:opacity-70 disabled:cursor-not-allowed`}
                        >
                            {isSending ? (
                                <><Loader2 size={18} className="animate-spin" /> Processing...</>
                            ) : emailStatus === 'quoted' ? (
                                <><CheckCircle size={18} /> Contract & Link Sent</>
                            ) : (
                                <><Calculator size={18} /> Generate Link & Send Contract</>
                            )}
                        </button>
                        
                        {emailStatus === 'quoted' && (
                            <p className="text-center text-emerald-500 text-xs mt-3 flex items-center justify-center gap-1 animate-in fade-in">
                                <Check size={12}/> Secure Payment Link has been emailed to client.
                            </p>
                        )}
                        {!emailStatus && (
                            <p className="text-center text-[10px] text-stone-400 mt-3">
                                Generates a secure link pointing to <u>localhost:3000</u>
                            </p>
                        )}
                      </div>
                  </div>

                  {/* --- RIGHT COLUMN: PREVIEW --- */}
                  <div className="flex flex-col h-full pl-0 xl:pl-6 border-l-0 xl:border-l border-dashed border-stone-200 dark:border-stone-800">
                     <div className="mb-4 flex items-end justify-between pb-2 border-b border-[#C9A25D]/20">
                         <div className="flex items-center gap-2">
                             <Eye size={16} className="text-[#C9A25D]"/>
                             <h3 className={`font-serif text-2xl text-[#C9A25D]`}>Client View Simulation</h3>
                         </div>
                         <span className="text-[9px] uppercase tracking-widest text-stone-400 font-bold border border-stone-200 dark:border-stone-800 px-2 py-1 rounded">Live Render</span>
                     </div>
                     
                     <QuotationPreviewCard 
                        booking={{...details, addOns: bookingData?.addOns, selectedPackageId: bookingData?.selectedPackageId}}
                        financials={{grandTotal: (proposalTotal*1.1), downpayment: downpaymentAmount, balance: (proposalTotal*1.1 - downpaymentAmount)}}
                        theme={theme}
                        darkMode={darkMode}
                     />
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default ContractTab;
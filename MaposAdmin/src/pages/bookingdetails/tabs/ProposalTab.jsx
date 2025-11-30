import React from 'react';
import { Utensils, Trash2, Loader2, CheckCircle, Send } from "lucide-react";

const ProposalTab = ({ 
    details, theme, proposalTotal, pricePerHead, 
    handlePriceChange, handleSendProposal, isSending, emailStatus, setShowDeclineModal 
}) => {
  
  const formatString = (str) => (!str ? "" : str.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()));

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className={`font-serif text-2xl ${theme.text}`}>Build Proposal</h3>
          <p className={`text-xs ${theme.subText} mt-1`}>Ref No. {details.id}-QUO</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-widest text-stone-400">Total Estimated Cost</p>
          <p className="font-serif text-3xl text-[#C9A25D]">₱ {Number(proposalTotal).toLocaleString()}</p>
        </div>
      </div>
      
      <div className="space-y-6">
        <div className={`border ${theme.border} ${theme.cardBg} p-6 rounded-sm`}>
          <h4 className={`text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2 ${theme.text}`}><Utensils size={16} /> Selected Service Style</h4>
          
          {/* --- UPDATED LINE: Removed background classes (bg-stone-50 dark:bg-stone-800/50) --- */}
          <div className={`p-6 border ${theme.border} rounded-sm flex flex-col md:flex-row justify-between items-center gap-6`}>
              <div className="flex-1">
                  <h3 className={`font-serif text-2xl ${theme.text} mb-1`}>{formatString(details.serviceStyle)} Service</h3>
                  <p className={`text-xs ${theme.subText}`}>Requested by client for {details.guests} guests</p>
              </div>
              <div className="flex items-center gap-4">
                  <label className="text-[10px] uppercase tracking-widest text-stone-400 whitespace-nowrap">Set Price Per Head</label>
                  <div className={`flex items-center border-b ${theme.border} pb-1 w-32`}>
                      <span className={`text-lg ${theme.subText} mr-2`}>₱</span>
                      <input type="number" value={pricePerHead} onChange={handlePriceChange} className={`w-full bg-transparent text-right font-serif text-2xl ${theme.text} focus:outline-none no-spinner`}/>
                  </div>
              </div>
          </div>
        </div>

        <div className={`mt-8 p-8 border ${theme.border} ${theme.cardBg} rounded-sm shadow-sm`}>
          <h4 className="text-[10px] uppercase tracking-[0.2em] mb-6 font-bold text-stone-400 border-b border-dashed border-stone-200 dark:border-stone-800 pb-2">Cost Breakdown</h4>
          <div className={`space-y-4 text-sm ${theme.text}`}>
            <div className="flex justify-between items-center"><span>Food & Beverage ({details.guests} pax @ ₱{pricePerHead})</span><span className="font-serif text-base">₱ {Number(proposalTotal).toLocaleString()}</span></div>
            <div className="flex justify-between items-center text-stone-400"><span>Service Charge (10%)</span><span className="font-serif text-base">₱ {(proposalTotal * 0.1).toLocaleString()}</span></div>
            <div className={`border-t ${theme.border} pt-4 mt-4 flex justify-between items-end`}><span className={`font-bold text-xs uppercase tracking-widest ${theme.text}`}>Grand Total</span><span className="font-serif text-2xl text-[#C9A25D]">₱ {(proposalTotal * 1.1).toLocaleString()}</span></div>
          </div>
        </div>

        <div className="flex justify-between items-center pt-6 border-t border-stone-100 dark:border-stone-800">
            <button onClick={() => setShowDeclineModal(true)} className="text-stone-500 hover:text-red-500 hover:border-red-500 border border-stone-300 dark:border-stone-700 px-6 py-3 rounded-sm text-xs uppercase tracking-widest font-bold flex items-center gap-2 transition-all hover:bg-red-50 dark:hover:bg-red-900/10"><Trash2 size={16} /> Decline Inquiry</button>
            <div className="flex flex-col items-end gap-2">
                <button onClick={handleSendProposal} disabled={isSending || emailStatus === 'success'} className={`flex items-center gap-2 px-8 py-3 rounded-sm text-sm uppercase tracking-wider font-bold transition-all duration-300 ${emailStatus === 'success' ? "bg-emerald-600 text-white cursor-default" : "bg-[#C9A25D] text-white hover:bg-[#b08d55] shadow-lg hover:shadow-[#C9A25D]/20"} disabled:opacity-70 disabled:cursor-not-allowed`}>
                    {isSending ? <><Loader2 size={16} className="animate-spin" /> Sending...</> : emailStatus === 'success' ? <><CheckCircle size={16} /> Proposal Sent</> : <><Send size={16} /> Send Proposal</>}
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ProposalTab;
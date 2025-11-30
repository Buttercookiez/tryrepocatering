import React from 'react';
import { 
    User, Utensils, Check, Plus, FileText, CheckCircle, 
    MapPin, ShieldCheck, FileBadge 
} from "lucide-react";
import { PACKAGES, ADD_ONS } from './BookingHelpers'; 

const QuotationPreviewCard = ({ booking, financials, theme, darkMode }) => {
    // 1. Resolve Data
    const selectedPkgId = booking.selectedPackageId || 'premium';  
    const selectedPackage = PACKAGES.find(p => p.id === selectedPkgId) || PACKAGES[1];
    
    const selectedAddOnIds = booking.addOns || []; 
    // const selectedAddOnIds = ['lechon', 'mobile_bar']; 

    const guestCount = booking.guests || 100;

    // 2. Local Calculation
    const packageTotal = selectedPackage.price * guestCount;
    
    const addOnsTotal = selectedAddOnIds.reduce((total, id) => {
        const item = ADD_ONS.find(a => a.id === id);
        if (!item) return total;
        return total + (item.type === 'per_head' ? item.price * guestCount : item.price);
    }, 0);

    const transportFee = 1000;
    
    // 3. Financials
    const displayTotal = financials?.grandTotal || (packageTotal + addOnsTotal + transportFee) * 1.1;
    const displayDownpayment = financials?.downpayment || (displayTotal * 0.5);
    const displayBalance = financials?.balance || (displayTotal - displayDownpayment);

    // 4. Dynamic Styles
    const styles = {
        cardBg: darkMode ? "bg-[#141414]" : "bg-white",
        // UPDATED: Set innerBg to transparent so there are no gray boxes
        innerBg: "bg-transparent", 
        textMain: darkMode ? "text-stone-300" : "text-stone-800",
        textSub: darkMode ? "text-stone-500" : "text-stone-400",
        border: darkMode ? "border-stone-800" : "border-stone-200",
        headerBg: "#080808" 
    };

    return (
        // ADDED: hover:border-[#C9A25D] and transition for the "Simple Hover" effect
        <div className={`border border-[#C9A25D] rounded-sm shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700 h-full flex flex-col ${styles.cardBg} transition-all duration-300 hover:shadow-[#C9A25D]/10 hover:shadow-2xl`}>
            
            {/* --- HEADER --- */}
            <div className="p-8 relative overflow-hidden border-b border-[#C9A25D] min-h-[140px] flex items-center" style={{ backgroundColor: styles.headerBg }}>
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                   <ShieldCheck size={180} className="text-white"/>
                </div>
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#C9A25D] via-yellow-600 to-[#C9A25D]"></div>
                
                <div className="relative z-10 w-full flex justify-between items-end">
                   <div>
                       <div className="flex items-center gap-2 mb-3">
                           <FileBadge size={14} className="text-[#C9A25D]" />
                           <p className="text-[9px] text-[#C9A25D] uppercase tracking-[0.3em] font-bold">Formal Proposal</p>
                       </div>
                       <h2 className="text-white font-serif text-3xl tracking-wide">Quotation</h2>
                       <p className="text-stone-600 font-mono text-[10px] mt-1 uppercase tracking-widest">Ref: {booking.id || 'BK-####'}</p>
                   </div>
                   <div className="text-right hidden sm:block">
                        <p className="text-[#C9A25D] font-serif text-lg leading-none mb-1">Mapos Catering</p>
                        <p className="text-[9px] text-stone-600 uppercase tracking-[0.2em]">Premium Events</p>
                   </div>
                </div>
            </div>
            
            {/* --- BODY --- */}
            <div className={`p-8 lg:p-10 ${styles.cardBg} flex-1`}>
                
                {/* 1. Client & Event Details */}
                <div className={`mb-10 border-b ${styles.border} pb-8`}>
                    <h3 className={`text-[10px] font-bold uppercase tracking-widest mb-6 flex items-center gap-2 ${styles.textMain}`}>
                        <User size={14} className="text-[#C9A25D]" /> 1. Client & Event Details
                    </h3>
                    <div className={`grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8 p-6 rounded-sm border ${styles.border} ${styles.innerBg}`}>
                         <div className="space-y-1">
                            <span className={`text-[9px] uppercase ${styles.textSub} block tracking-widest`}>Client Name</span>
                            <span className={`font-serif text-xl ${styles.textMain}`}>{booking.client}</span>
                         </div>
                         <div className="space-y-1">
                            <span className={`text-[9px] uppercase ${styles.textSub} block tracking-widest`}>Event Date</span>
                            <span className={`text-sm font-medium ${styles.textMain}`}>{booking.date}</span>
                         </div>
                         <div className={`col-span-1 md:col-span-2 pt-4 mt-2 border-t ${styles.border}`}>
                             <div className="flex justify-between items-center">
                                 <div>
                                    <span className={`text-[9px] uppercase ${styles.textSub} block tracking-widest`}>Venue</span>
                                    <span className={`text-sm font-medium ${styles.textMain} flex items-center gap-2`}>
                                        <MapPin size={12} className="text-[#C9A25D]"/> {booking.venue}
                                    </span>
                                 </div>
                                 <div className="text-right border border-[#C9A25D] px-3 py-1 rounded bg-transparent">
                                     <span className="text-[9px] uppercase text-[#C9A25D] block tracking-widest">Confirmed Pax</span>
                                     <span className={`text-base font-serif ${styles.textMain}`}>{guestCount} Guests</span>
                                 </div>
                             </div>
                         </div>
                    </div>
                </div>

                {/* 2. Selected Package */}
                <div className={`mb-10 border-b ${styles.border} pb-8`}>
                    <h3 className={`text-[10px] font-bold uppercase tracking-widest mb-6 flex items-center gap-2 ${styles.textMain}`}>
                        <Utensils size={14} className="text-[#C9A25D]" /> 2. Selected Package
                    </h3>
                    
                    <div className={`flex justify-between items-baseline mb-6 p-4 border ${styles.border} rounded-sm ${styles.innerBg}`}>
                        <div>
                            <h4 className={`font-serif text-2xl ${styles.textMain}`}>{selectedPackage.name}</h4>
                            <p className="text-[9px] text-stone-500 uppercase tracking-widest mt-1">Base Price Configuration</p>
                        </div>
                        <div className="text-right">
                            <span className="font-mono text-[#C9A25D] font-medium text-lg block">
                                ₱{selectedPackage.price.toLocaleString()}
                            </span>
                            <span className="text-[9px] text-stone-500 uppercase">Per Head</span>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-8 px-2">
                        <div>
                            <span className={`text-[9px] uppercase ${styles.textSub} block mb-3 font-bold`}>Package Inclusions</span>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {selectedPackage.features.map(f => (
                                    <li key={f} className={`text-xs flex items-start gap-2 ${styles.textMain}`}>
                                        <Check size={12} className="mt-0.5 text-[#C9A25D] shrink-0"/> 
                                        <span className="opacity-80">{f}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* 3. Enhancements */}
                <div className={`mb-10 border-b ${styles.border} pb-8`}>
                    <h3 className={`text-[10px] font-bold uppercase tracking-widest mb-6 flex items-center gap-2 ${styles.textMain}`}>
                        <Plus size={14} className="text-[#C9A25D]" /> 3. Enhancements
                    </h3>
                    {selectedAddOnIds.length > 0 ? (
                        <div className="space-y-3">
                            {selectedAddOnIds.map(id => {
                                const item = ADD_ONS.find(a => a.id === id);
                                if(!item) return null;
                                return (
                                    <div key={id} className={`flex justify-between items-center text-sm p-3 border ${styles.border} rounded-sm ${styles.innerBg}`}>
                                        <div>
                                            <span className={`block font-medium ${styles.textMain}`}>{item.name}</span>
                                            <span className={`text-[9px] ${styles.textSub} uppercase`}>{item.type === 'fixed' ? 'Fixed Rate' : 'Per Head'}</span>
                                        </div>
                                        <span className={`font-mono text-sm ${styles.textMain}`}>
                                            + ₱{item.price.toLocaleString()}
                                            {item.type === 'per_head' && <span className={`text-[9px] ml-1 ${styles.textSub}`}>(x{guestCount})</span>}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <p className={`text-xs italic ${styles.textSub} px-2`}>No additional enhancements selected.</p>
                    )}
                </div>

                {/* 4. Financial Breakdown */}
                <div className={`mb-10 border-b ${styles.border} pb-8`}>
                    <h3 className={`text-[10px] font-bold uppercase tracking-widest mb-6 flex items-center gap-2 ${styles.textMain}`}>
                        <FileText size={14} className="text-[#C9A25D]" /> 4. Financial Breakdown
                    </h3>
                    <div className={`border ${styles.border} rounded-sm p-6 ${styles.innerBg}`}>
                        <table className="w-full text-sm">
                            <thead className={`text-[9px] uppercase ${styles.textSub} border-b ${styles.border}`}>
                                <tr>
                                    <th className="text-left py-2 font-bold tracking-wider">Description</th>
                                    <th className="text-right py-2 font-bold tracking-wider">Amount</th>
                                </tr>
                            </thead>
                            <tbody className={styles.textMain}>
                                <tr className={`border-b border-dashed ${styles.border}`}>
                                    <td className="py-4">
                                        <span className="block font-medium">Package Cost</span>
                                        <span className={`text-[10px] ${styles.textSub}`}>{selectedPackage.name} x {guestCount} pax</span>
                                    </td>
                                    <td className="text-right py-4 font-mono">₱ {packageTotal.toLocaleString()}</td>
                                </tr>
                                <tr className={`border-b border-dashed ${styles.border}`}>
                                    <td className="py-4">
                                        <span className="block font-medium">Total Enhancements</span>
                                    </td>
                                    <td className="text-right py-4 font-mono">₱ {addOnsTotal.toLocaleString()}</td>
                                </tr>
                                <tr>
                                    <td className="py-4">
                                        <span className="block font-medium">Logistics & Handling</span>
                                        <span className={`text-[10px] ${styles.textSub}`}>Transport & Setup Fee</span>
                                    </td>
                                    <td className="text-right py-4 font-mono">₱ {transportFee.toLocaleString()}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* --- TOTAL CONTRACT BOX (Transparent BG) --- */}
                    <div className={`mt-4 border border-[#C9A25D] p-5 rounded-sm flex justify-between items-center ${styles.innerBg}`}>
                         <span className="text-[10px] uppercase font-bold tracking-widest text-[#C9A25D]">Total Contract</span>
                         <div className="flex items-start">
                            <span className="text-[#C9A25D] font-serif text-lg mr-1">₱</span>
                            <span className="font-serif text-3xl text-[#C9A25D]">{displayTotal.toLocaleString()}</span>
                         </div>
                    </div>
                </div>

                {/* 5. Payment Terms */}
                <div className="mb-10">
                     <h3 className={`text-[10px] font-bold uppercase tracking-widest mb-6 flex items-center gap-2 ${styles.textMain}`}>
                        <CheckCircle size={14} className="text-[#C9A25D]" /> 5. Payment Terms
                    </h3>
                    <div className={`p-6 border border-[#C9A25D]/30 rounded-sm relative overflow-hidden ${styles.innerBg}`}>
                         <div className="absolute top-0 left-0 w-1 h-full bg-[#C9A25D]"></div>
                         <div className="flex justify-between items-center mb-2">
                            <span className={`text-xs font-bold uppercase tracking-wider ${styles.textMain}`}>Required Downpayment (50%)</span>
                            <span className="text-xl font-serif font-bold text-[#C9A25D]">₱ {displayDownpayment.toLocaleString()}</span>
                         </div>
                         <div className={`flex justify-between items-center ${styles.textSub} text-[10px]`}>
                            <span>Remaining balance due 7 days before event</span>
                            <span className="font-mono text-xs">Bal: ₱ {displayBalance.toLocaleString()}</span>
                         </div>
                    </div>
                </div>

                {/* Footer */}
                <div className={`mt-8 pt-8 border-t ${styles.border} text-center`}>
                    <p className="text-[9px] uppercase text-stone-500 tracking-[0.2em] mb-2 font-bold">Valid for 7 Days</p>
                    <p className="text-[9px] text-stone-600">Mapos Catering Services • Automated Quotation System</p>
                </div>
            </div>
        </div>
    );
};

export default QuotationPreviewCard;
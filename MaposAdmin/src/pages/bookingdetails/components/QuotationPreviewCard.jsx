import React from 'react';
import { 
    User, Utensils, Check, Plus, FileText, CheckCircle, 
    Info, MapPin, ShieldCheck, FileBadge 
} from "lucide-react";
import { PACKAGES, ADD_ONS } from './BookingHelpers'; 

const QuotationPreviewCard = ({ booking, financials, theme, darkMode }) => {
    // 1. Resolve Data
    const selectedPkgId = booking.selectedPackageId || 'premium'; 
    const selectedPackage = PACKAGES.find(p => p.id === selectedPkgId) || PACKAGES[1];
    
    const selectedAddOnIds = booking.addOns || []; 
    // Uncomment next line to test UI if data is empty
    // const selectedAddOnIds = ['lechon', 'mobile_bar']; 

    const guestCount = booking.guests || 100;

    // 2. Local Calculation for Breakdown Display
    const packageTotal = selectedPackage.price * guestCount;
    
    const addOnsTotal = selectedAddOnIds.reduce((total, id) => {
        const item = ADD_ONS.find(a => a.id === id);
        if (!item) return total;
        return total + (item.type === 'per_head' ? item.price * guestCount : item.price);
    }, 0);

    const transportFee = 1000;
    
    // 3. Financials (Prefer props from parent for synchronization)
    const displayTotal = financials?.grandTotal || (packageTotal + addOnsTotal + transportFee) * 1.1;
    const displayDownpayment = financials?.downpayment || (displayTotal * 0.5);
    const displayBalance = financials?.balance || (displayTotal - displayDownpayment);

    return (
        <div className={`border ${theme.border} rounded-sm shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700 h-full flex flex-col bg-white dark:bg-[#0a0a0a]`}>
            
            {/* --- HEADER (Black & Gold) --- */}
            <div className="bg-[#050505] p-6 relative overflow-hidden border-b border-[#C9A25D] min-h-[140px] flex items-center">
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                   <ShieldCheck size={180} className="text-white"/>
                </div>
                {/* Gold Gradient Line */}
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#C9A25D] via-yellow-600 to-[#C9A25D]"></div>
                
                <div className="relative z-10 w-full flex justify-between items-end">
                   <div>
                       <div className="flex items-center gap-2 mb-3">
                           <FileBadge size={16} className="text-[#C9A25D]" />
                           <p className="text-[10px] text-[#C9A25D] uppercase tracking-[0.3em] font-bold">Formal Proposal</p>
                       </div>
                       <h2 className="text-white font-serif text-3xl tracking-wide">Quotation</h2>
                       <p className="text-stone-500 font-mono text-xs mt-1">Ref: {booking.id || 'BK-####'}</p>
                   </div>
                   <div className="text-right hidden sm:block">
                        <p className="text-[#C9A25D] font-serif text-lg">Mapos Catering</p>
                        <p className="text-[10px] text-stone-500 uppercase tracking-widest">Premium Events</p>
                   </div>
                </div>
            </div>
            
            {/* --- BODY --- */}
            <div className={`p-8 lg:p-10 bg-white dark:bg-[#0a0a0a] text-stone-800 dark:text-stone-300 text-sm flex-1`}>
                
                {/* 1. Client Info */}
                <div className="mb-10 border-b border-dashed border-stone-200 dark:border-stone-800 pb-8">
                    <h3 className={`text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2 ${theme.text}`}>
                        <User size={14} className="text-[#C9A25D]" /> 1. Client & Event Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8 p-6 rounded-sm bg-transparent border border-stone-200 dark:border-stone-800">
                         <div className="space-y-1">
                            <span className="text-[10px] uppercase text-stone-400 block tracking-widest">Client Name</span>
                            <span className={`font-serif text-xl ${theme.text}`}>{booking.client}</span>
                         </div>
                         <div className="space-y-1">
                            <span className="text-[10px] uppercase text-stone-400 block tracking-widest">Event Date</span>
                            <span className={`text-sm ${theme.text}`}>{booking.date}</span>
                         </div>
                         <div className="col-span-1 md:col-span-2 pt-4 mt-2 border-t border-dashed border-stone-200 dark:border-stone-800">
                             <div className="flex justify-between items-center">
                                 <div>
                                    <span className="text-[10px] uppercase text-stone-400 block tracking-widest">Venue</span>
                                    <span className={`text-sm font-medium ${theme.text} flex items-center gap-2`}>
                                        <MapPin size={12}/> {booking.venue}
                                    </span>
                                 </div>
                                 <div className="text-right border border-[#C9A25D] px-3 py-1 rounded">
                                     <span className="text-[9px] uppercase text-[#C9A25D] block tracking-widest">Confirmed Pax</span>
                                     <span className={`text-base font-bold ${theme.text}`}>{guestCount} Guests</span>
                                 </div>
                             </div>
                         </div>
                    </div>
                </div>

                {/* 2. Package Details (Restored Full View) */}
                <div className="mb-10 border-b border-dashed border-stone-200 dark:border-stone-800 pb-8">
                    <h3 className={`text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2 ${theme.text}`}>
                        <Utensils size={14} className="text-[#C9A25D]" /> 2. Selected Package
                    </h3>
                    
                    <div className="flex justify-between items-baseline mb-6 p-4 border border-stone-200 dark:border-stone-800 rounded-sm">
                        <div>
                            <h4 className={`font-serif text-2xl ${theme.text}`}>{selectedPackage.name}</h4>
                            <p className="text-[10px] text-stone-500 uppercase tracking-widest mt-1">Base Price Configuration</p>
                        </div>
                        <span className="font-mono text-[#C9A25D] font-bold text-lg">
                            ₱{selectedPackage.price.toLocaleString()} <span className="text-xs text-stone-400 font-normal">/head</span>
                        </span>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-8">
                        {/* Features */}
                        <div>
                            <span className="text-[10px] uppercase text-stone-400 block mb-3 border-b border-stone-200 dark:border-stone-800 pb-1 w-full font-bold">Inclusions</span>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {selectedPackage.features.map(f => (
                                    <li key={f} className={`text-xs flex items-start gap-2 ${theme.subText}`}>
                                        <Check size={14} className="mt-0.5 text-[#C9A25D] shrink-0"/> {f}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        {/* Menu */}
                        <div>
                            <span className="text-[10px] uppercase text-stone-400 block mb-3 border-b border-stone-200 dark:border-stone-800 pb-1 w-full font-bold">Menu Selection</span>
                            <div className="space-y-4">
                                {selectedPackage.menu.map((category, idx) => (
                                    <div key={idx}>
                                    <p className={`text-[10px] font-bold text-[#C9A25D] mb-1 uppercase tracking-wider`}>{category.category}</p>
                                    <ul className="space-y-2 ml-2 border-l border-stone-200 dark:border-stone-800 pl-4">
                                        {category.items.map((m, i) => (
                                            <li key={i} className={`text-xs ${theme.subText}`}>
                                                <strong className="text-stone-700 dark:text-stone-300 block">{m.name}</strong>
                                                {/* If your data has descriptions, show them here */}
                                            </li>
                                        ))}
                                    </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Add Ons */}
                <div className="mb-10 border-b border-dashed border-stone-200 dark:border-stone-800 pb-8">
                    <h3 className={`text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2 ${theme.text}`}>
                        <Plus size={14} className="text-[#C9A25D]" /> 3. Enhancements
                    </h3>
                    {selectedAddOnIds.length > 0 ? (
                        <div className="space-y-2">
                            {selectedAddOnIds.map(id => {
                                const item = ADD_ONS.find(a => a.id === id);
                                if(!item) return null;
                                return (
                                    <div key={id} className={`flex justify-between items-center text-sm p-3 border border-stone-200 dark:border-stone-800 rounded-sm`}>
                                        <div>
                                            <span className={`block font-bold ${theme.text}`}>{item.name}</span>
                                            <span className="text-[10px] text-stone-400 uppercase">{item.type === 'fixed' ? 'Fixed Rate' : 'Per Head'}</span>
                                        </div>
                                        <span className="font-mono font-bold text-stone-600 dark:text-stone-400">
                                            + ₱{item.price.toLocaleString()}
                                            {item.type === 'per_head' && <span className="text-[10px] font-normal text-stone-400 block text-right">(x {guestCount})</span>}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <p className={`text-xs italic ${theme.subText}`}>No additional enhancements.</p>
                    )}
                </div>

                {/* 4. Financial Summary */}
                <div className="mb-10 border-b border-dashed border-stone-200 dark:border-stone-800 pb-8">
                    <h3 className={`text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2 ${theme.text}`}>
                        <FileText size={14} className="text-[#C9A25D]" /> 4. Financial Breakdown
                    </h3>
                    <div className="bg-transparent border border-stone-200 dark:border-stone-800 rounded-sm p-6">
                        <table className="w-full text-sm">
                            <thead className="text-[10px] uppercase text-stone-400 border-b border-stone-200 dark:border-stone-800">
                                <tr>
                                    <th className="text-left py-2 font-medium">Item</th>
                                    <th className="text-right py-2 font-medium">Amount</th>
                                </tr>
                            </thead>
                            <tbody className={theme.text}>
                                <tr>
                                    <td className="py-3">
                                        <span className="block font-bold">Package Cost</span>
                                        <span className="text-[10px] text-stone-500">{selectedPackage.name} x {guestCount} pax</span>
                                    </td>
                                    <td className="text-right py-3 font-mono">₱ {packageTotal.toLocaleString()}</td>
                                </tr>
                                <tr>
                                    <td className="py-3">
                                        <span className="block font-bold">Enhancements</span>
                                    </td>
                                    <td className="text-right py-3 font-mono">₱ {addOnsTotal.toLocaleString()}</td>
                                </tr>
                                <tr>
                                    <td className="py-3">
                                        <span className="block font-bold">Logistics & Service</span>
                                        <span className="text-[10px] text-stone-500">Transport & Setup</span>
                                    </td>
                                    <td className="text-right py-3 font-mono">₱ {transportFee.toLocaleString()}</td>
                                </tr>
                                <tr className="border-t border-stone-200 dark:border-stone-700">
                                    <td className="py-4 font-bold uppercase text-xs tracking-wider text-[#C9A25D]">Grand Total (VAT Inc.)</td>
                                    <td className="text-right py-4 font-bold text-2xl text-[#C9A25D] font-serif">₱ {displayTotal.toLocaleString()}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* 5. Payment Schedule */}
                <div className="mb-10">
                     <h3 className={`text-xs font-bold uppercase tracking-widest mb-6 flex items-center gap-2 ${theme.text}`}>
                        <CheckCircle size={14} className="text-[#C9A25D]" /> 5. Payment Terms
                    </h3>
                    <div className={`p-6 border border-[#C9A25D] rounded-sm relative overflow-hidden bg-transparent`}>
                         <div className="absolute top-0 left-0 w-1 h-full bg-[#C9A25D]"></div>
                         <div className="flex justify-between items-center mb-2">
                            <span className={`text-sm font-bold ${theme.text}`}>Required Downpayment (50%)</span>
                            <span className={`text-xl font-serif font-bold text-[#C9A25D]`}>₱ {displayDownpayment.toLocaleString()}</span>
                         </div>
                         <div className="flex justify-between items-center text-stone-500 text-xs">
                            <span>Balance due 7 days before event</span>
                            <span className="font-mono">₱ {displayBalance.toLocaleString()}</span>
                         </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 pt-8 border-t border-stone-200 dark:border-stone-800 text-center">
                    <p className="text-[10px] uppercase text-stone-400 tracking-widest mb-2">Valid for 7 Days</p>
                    <p className="text-[9px] text-stone-500">Mapos Catering Services • Auto-Generated Quotation</p>
                </div>
            </div>
        </div>
    );
};

export default QuotationPreviewCard;
import React from 'react';
import { DollarSign, Wallet, AlertCircle, Bell, CreditCard, CheckCircle2, Clock } from "lucide-react";
import { renderStatusBadge } from "../components/BookingHelpers";

const PaymentsTab = ({ details, theme, darkMode }) => {
  
  // Calculate percentage for progress bar
  const totalCost = Number(details.budget || 0);
  const paidAmount = Number(details.downpayment || 0);
  const progress = totalCost > 0 ? (paidAmount / totalCost) * 100 : 0;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      {/* 1. HEADER SECTION */}
      <div className="flex justify-between items-end border-b border-stone-200 dark:border-stone-800 pb-6">
        <div>
          <h3 className={`font-serif text-2xl ${theme.text}`}>Financial Overview</h3>
          <p className={`text-xs ${theme.subText} mt-1`}>Ref No. {details.id}-PAY</p>
        </div>
        <div className="text-right">
           <div className={`text-[10px] uppercase tracking-widest ${theme.subText} mb-1`}>Settlement Progress</div>
           <div className="flex items-center gap-3">
              <div className="w-32 h-1.5 bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden">
                  <div className="h-full bg-[#C9A25D] transition-all duration-1000" style={{ width: `${progress}%` }}></div>
              </div>
              <span className={`text-xs font-bold ${theme.text}`}>{Math.round(progress)}%</span>
           </div>
        </div>
      </div>

      {/* 2. STATS CARDS (Transparent as requested) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Total Contract", val: details.budget, color: "text-[#C9A25D]", icon: DollarSign, border: "border-stone-200 dark:border-stone-800" },
          { label: "Total Paid", val: (details.downpayment || 0), color: "text-emerald-600 dark:text-emerald-500", icon: Wallet, border: "border-emerald-500/20" },
          { label: "Outstanding Balance", val: details.balance, color: "text-red-500 dark:text-red-400", icon: AlertCircle, border: "border-red-500/20" },
        ].map((stat, idx) => (
          <div key={idx} className={`p-6 border ${stat.border} rounded-sm flex flex-col justify-between h-32 hover:shadow-lg transition-all duration-300 bg-transparent`}>
            <div className="flex justify-between items-start">
              <p className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-bold">{stat.label}</p>
              <stat.icon size={16} className={`${stat.color} opacity-80`} strokeWidth={1.5} />
            </div>
            <p className={`font-serif text-3xl ${stat.color} tracking-wide`}>₱ {Number(stat.val).toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* 3. PAYMENT SCHEDULE (RESTORED TO OLD DESIGN) */}
      <div className={`border ${theme.border} ${theme.cardBg} rounded-sm`}>
        {/* Table Header */}
        <div className={`flex justify-between items-center p-6 border-b ${theme.border} bg-transparent`}>
          <h4 className={`font-serif text-xl ${theme.text}`}>Payment Schedule</h4>
          <button className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[#C9A25D] border border-[#C9A25D] px-4 py-2 rounded-sm hover:bg-[#C9A25D] hover:text-white transition-colors bg-transparent">
            <Bell size={12} /> Send Reminder
          </button>
        </div>

        {/* Column Titles */}
        <div className={`grid grid-cols-12 gap-4 px-6 py-3 border-b ${theme.border} text-[10px] uppercase tracking-widest text-stone-400 bg-transparent`}>
          <div className="col-span-4">Description</div>
          <div className="col-span-3">Due Date</div>
          <div className="col-span-3 text-right">Amount</div>
          <div className="col-span-2 text-right">Status</div>
        </div>

        {/* Rows */}
        <div className={`divide-y ${darkMode ? "divide-stone-800" : "divide-stone-100"}`}>
          {[
            { 
                label: "50% Downpayment", 
                sub: "Required to lock date",
                amount: details.downpayment, 
                status: details.downpaymentStatus, 
                icon: details.downpaymentStatus === 'Paid' ? CheckCircle2 : Clock,
                iconColor: details.downpaymentStatus === 'Paid' ? 'text-emerald-500' : 'text-stone-400',
                due: "Immediate" 
            },
            { 
                label: "Final Balance", 
                sub: "Settlement before event",
                amount: details.balance, 
                status: "Unpaid", 
                icon: DollarSign,
                iconColor: "text-stone-400",
                due: "1 Week Before" 
            },
          ].map((row, i) => (
            <div key={i} className={`grid grid-cols-12 gap-4 items-center px-6 py-5 ${theme.hoverBg} transition-colors duration-300 group`}>
              
              <div className="col-span-4 flex items-center gap-4">
                <div className={`p-2 rounded-full border border-stone-200 dark:border-stone-800 bg-transparent ${row.iconColor}`}>
                    <row.icon size={16} />
                </div>
                <div>
                    <span className={`block text-sm font-bold ${theme.text} mb-0.5 group-hover:text-[#C9A25D] transition-colors`}>{row.label}</span>
                    <span className="text-[10px] text-stone-400 italic">{row.sub}</span>
                </div>
              </div>

              <div className="col-span-3 text-xs text-stone-500 dark:text-stone-400 font-medium">
                  {row.due}
              </div>

              <div className="col-span-3 text-right">
                  <span className={`font-serif text-lg ${theme.text}`}>₱ {Number(row.amount).toLocaleString()}</span>
              </div>

              <div className="col-span-2 flex justify-end">
                  {renderStatusBadge(row.status)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PaymentsTab;
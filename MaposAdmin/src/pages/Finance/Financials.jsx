// src/pages/Finance/Financials.jsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  DollarSign, TrendingUp, FileText, Download, 
  PieChart, ArrowUpRight, Plus, Filter, ArrowUpDown,
  MoreHorizontal, CheckCircle, Clock, AlertCircle
} from 'lucide-react';

// Import Layout Components
import Sidebar from '../../components/layout/Sidebar';
import DashboardNavbar from '../../components/layout/Navbar';

// --- Animation Component ---
const FadeIn = ({ children, delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => { if (ref.current) observer.unobserve(ref.current); };
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

const Financials = () => {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  // Theme Persistence
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Sidebar Persistence
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const savedState = localStorage.getItem('sidebarState');
    return savedState !== null ? savedState === 'true' : true;
  });

  const [activeTab, setActiveTab] = useState('Finance');
  const [searchQuery, setSearchQuery] = useState("");

  const theme = {
    bg: darkMode ? 'bg-[#0c0c0c]' : 'bg-[#FAFAFA]',
    cardBg: darkMode ? 'bg-[#141414]' : 'bg-white',
    text: darkMode ? 'text-stone-200' : 'text-stone-900',
    subText: darkMode ? 'text-stone-500' : 'text-stone-500',
    border: darkMode ? 'border-stone-800' : 'border-stone-200',
    accent: 'text-[#C9A25D]',
    accentBg: 'bg-[#C9A25D]',
    hoverBg: darkMode ? 'hover:bg-stone-900' : 'hover:bg-stone-50',
  };

  // --- Mock Data ---
  const transactions = [
    { id: 'INV-001', client: 'Alcantara Wedding', date: 'Oct 24, 2024', amount: '12,500.00', status: 'Paid', type: 'Income' },
    { id: 'PO-089', vendor: 'Seafood Supplier Inc.', date: 'Oct 23, 2024', amount: '3,200.50', status: 'Cleared', type: 'Expense' },
    { id: 'INV-002', client: 'TechSolutions Gala', date: 'Oct 22, 2024', amount: '45,000.00', status: 'Pending', type: 'Income' },
    { id: 'INV-003', client: 'Isabella Debut', date: 'Oct 20, 2024', amount: '8,500.00', status: 'Overdue', type: 'Income' },
    { id: 'PO-090', vendor: 'Premium Bev Co.', date: 'Oct 18, 2024', amount: '1,150.00', status: 'Cleared', type: 'Expense' },
    { id: 'INV-004', client: 'Mayor Private Dinner', date: 'Oct 15, 2024', amount: '4,200.00', status: 'Paid', type: 'Income' },
  ];

  const filteredTransactions = transactions.filter(t => 
    t.client?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    t.vendor?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const chartData = [
    { month: 'MAY', rev: 65, exp: 40 },
    { month: 'JUN', rev: 55, exp: 45 },
    { month: 'JUL', rev: 80, exp: 50 },
    { month: 'AUG', rev: 95, exp: 60 },
    { month: 'SEP', rev: 70, exp: 30 },
    { month: 'OCT', rev: 100, exp: 55 },
  ];

  // --- Helper: Status Rendering ---
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Paid':
      case 'Cleared':
        return (
          <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-emerald-600 bg-emerald-500/10 px-3 py-1.5 rounded-sm font-medium border border-emerald-500/10">
            <CheckCircle size={11} /> {status}
          </span>
        );
      case 'Overdue':
        return (
          <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-red-500 bg-red-500/10 px-3 py-1.5 rounded-sm font-medium border border-red-500/10">
            <AlertCircle size={11} /> {status}
          </span>
        );
      case 'Pending':
        return (
          <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-amber-500 bg-amber-500/10 px-3 py-1.5 rounded-sm font-medium border border-amber-500/10">
            <Clock size={11} /> {status}
          </span>
        );
      default:
        return (
          <span className={`flex items-center gap-1.5 text-[10px] uppercase tracking-widest ${theme.subText} bg-stone-100 dark:bg-stone-800 px-3 py-1.5 rounded-sm font-medium`}>
            {status}
          </span>
        );
    }
  };

  return (
    <div className={`flex h-screen w-full overflow-hidden font-sans ${theme.bg} ${theme.text} selection:bg-[#C9A25D] selection:text-white transition-colors duration-500`}>
      
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=Inter:wght@300;400;500&display=swap');
          .font-serif { font-family: 'Cormorant Garamond', serif; }
          .font-sans { font-family: 'Inter', sans-serif; }
          .no-scrollbar::-webkit-scrollbar { display: none; }
        `}
      </style>

      <Sidebar 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        theme={theme} 
      />

      <main className="flex-1 flex flex-col relative overflow-hidden">
        <DashboardNavbar 
          activeTab="Financial Overview"
          theme={theme}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        <div className="flex-1 overflow-y-auto p-6 md:p-12 scroll-smooth no-scrollbar">
          
          {/* Header Actions */}
          <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
            <div>
              <h2 className="font-serif text-3xl italic">Cash Flow</h2>
              <p className={`text-xs mt-1 ${theme.subText}`}>October 2024 Report • Q4 Performance</p>
            </div>
            <div className="flex gap-3">
              <button className={`flex items-center gap-2 px-4 py-2.5 border ${theme.border} text-[10px] uppercase tracking-widest hover:text-[#C9A25D] transition-colors bg-transparent`}>
                <Download size={14} /> Export Report
              </button>
              <button className="flex items-center gap-2 bg-[#1c1c1c] text-white px-6 py-2.5 text-[10px] uppercase tracking-widest hover:bg-[#C9A25D] transition-colors">
                <Plus size={14} /> Create Invoice
              </button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            {[
              { label: 'Total Revenue', value: '$124,500', trend: '+12%', icon: DollarSign },
              { label: 'Net Profit', value: '$68,200', trend: '+8%', icon: TrendingUp },
              { label: 'Outstanding', value: '$14,350', trend: 'Pending', icon: FileText },
              { label: 'Expense Ratio', value: '42%', trend: '-2%', icon: PieChart },
            ].map((stat, idx) => (
              <FadeIn key={idx} delay={idx * 100}>
                <div className={`p-6 border ${theme.border} ${theme.cardBg} group hover:border-[#C9A25D]/30 transition-all duration-500 flex flex-col justify-between h-32`}>
                  <div className="flex justify-between items-start">
                    <span className={`text-[10px] uppercase tracking-[0.2em] ${theme.subText}`}>{stat.label}</span>
                    <stat.icon size={16} strokeWidth={1} className="text-[#C9A25D] opacity-80" />
                  </div>
                  <div className="flex items-baseline justify-between">
                    <h3 className="font-serif text-3xl md:text-4xl">{stat.value}</h3>
                    <span className={`text-xs font-medium flex items-center ${idx === 2 ? 'text-amber-500' : 'text-green-600'}`}>
                      {stat.trend === 'Pending' ? '' : <ArrowUpRight size={12} className="mr-1" />}
                      {stat.trend}
                    </span>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* Split Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            <div className="lg:col-span-2">
              <FadeIn delay={300}>
                <div className={`border ${theme.border} ${theme.cardBg} p-8 h-full min-h-[400px] flex flex-col`}>
                  <div className="flex justify-between items-center mb-10">
                    <h3 className="font-serif text-2xl italic">Budget vs Actual</h3>
                    <div className="flex gap-6">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-[#C9A25D]"></span>
                        <span className={`text-[10px] uppercase tracking-widest ${theme.subText}`}>Revenue</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-stone-300 dark:bg-stone-700"></span>
                        <span className={`text-[10px] uppercase tracking-widest ${theme.subText}`}>Expense</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 flex items-end justify-between gap-4 w-full px-2">
                    {chartData.map((data, i) => (
                      <div key={i} className="flex-1 flex flex-col justify-end h-full group relative">
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-stone-900 text-white text-xs p-2 rounded whitespace-nowrap z-10">
                          Rev: ${data.rev}k | Exp: ${data.exp}k
                        </div>
                        <div className="flex gap-1 items-end justify-center h-64 w-full">
                          <div style={{ height: `${data.rev}%` }} className="w-3 md:w-6 bg-[#C9A25D] opacity-90 hover:opacity-100 transition-all duration-700 rounded-t-sm"></div>
                          <div style={{ height: `${data.exp}%` }} className="w-3 md:w-6 bg-stone-300 dark:bg-stone-700 hover:bg-stone-400 transition-all duration-700 rounded-t-sm"></div>
                        </div>
                        <span className={`text-[10px] text-center mt-4 uppercase tracking-widest ${theme.subText}`}>
                          {data.month}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeIn>
            </div>

            <div className="lg:col-span-1">
              <FadeIn delay={400}>
                <div className={`border ${theme.border} ${theme.cardBg} p-8 h-full`}>
                  <div className="flex justify-between items-end mb-8">
                    <h3 className="font-serif text-2xl italic">Profit by Event</h3>
                    <Filter size={16} className={theme.subText} />
                  </div>
                  <div className="space-y-6">
                    {[
                      { type: 'Weddings', amount: '$85,000', pct: '68%', color: 'bg-[#C9A25D]' },
                      { type: 'Corporate', amount: '$25,500', pct: '20%', color: 'bg-stone-400' },
                      { type: 'Private', amount: '$14,000', pct: '12%', color: 'bg-stone-200' },
                    ].map((item, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-xs uppercase tracking-widest mb-2">
                          <span>{item.type}</span>
                          <span className={theme.text}>{item.amount}</span>
                        </div>
                        <div className={`w-full h-1.5 ${darkMode ? 'bg-stone-800' : 'bg-stone-100'} rounded-full overflow-hidden`}>
                          <div className={`h-full ${item.color}`} style={{ width: item.pct }}></div>
                        </div>
                        <p className={`text-[10px] text-right mt-1 ${theme.subText}`}>{item.pct} of total</p>
                      </div>
                    ))}
                  </div>
                  <div className={`mt-10 p-4 border ${theme.border} ${darkMode ? 'bg-stone-900/50' : 'bg-stone-50'} rounded-sm`}>
                    <div className="flex items-start gap-3">
                      <ArrowUpRight className="text-green-500 mt-1" size={16} />
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide">Highest Earner</p>
                        <p className={`font-serif text-lg ${theme.text} mt-1`}>Full Course Plated</p>
                        <p className={`text-[10px] ${theme.subText}`}>+24% demand vs last month</p>
                      </div>
                    </div>
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>

          {/* 4. Recent Transactions Table (Fixed Alignment) */}
          <FadeIn delay={500}>
            <div className={`border ${theme.border} ${theme.cardBg} rounded-sm min-h-[400px]`}>
              <div className="p-6 md:p-8 flex justify-between items-center border-b border-stone-100 dark:border-stone-800">
                <h3 className="font-serif text-2xl italic">Recent Transactions</h3>
                <button className={`text-[10px] uppercase tracking-[0.2em] ${theme.subText} hover:text-[#C9A25D] transition-colors`}>
                  View All
                </button>
              </div>

              {/* Table Header - Updated Col Spans for Better Alignment */}
              <div className={`
                grid grid-cols-12 gap-4 px-8 py-4 
                border-b ${theme.border} 
                text-[10px] uppercase tracking-[0.2em] font-medium text-stone-400 select-none
              `}>
                <div className="col-span-2 md:col-span-1 hidden md:block">Ref ID</div>
                <div className="col-span-5 md:col-span-4 flex items-center gap-2 cursor-pointer hover:text-[#C9A25D] transition-colors">
                  Client / Vendor <ArrowUpDown size={12} className="opacity-50"/>
                </div>
                <div className="col-span-3 hidden md:block">Date Issued</div>
                {/* Aligned Right */}
                <div className="col-span-3 md:col-span-2 text-right">Amount</div>
                {/* Aligned Right & Increased Span for Badge Space */}
                <div className="col-span-4 md:col-span-2 text-right">Status</div>
              </div>

              {/* Rows */}
              <div className={`divide-y ${darkMode ? 'divide-stone-800' : 'divide-stone-100'}`}>
                {filteredTransactions.map((tx) => (
                  <div 
                    key={tx.id} 
                    className={`grid grid-cols-12 gap-4 px-8 py-5 items-center group ${theme.hoverBg} transition-colors duration-300`}
                  >
                    {/* ID */}
                    <div className={`col-span-2 md:col-span-1 hidden md:block text-xs ${theme.subText} font-mono tracking-wider`}>
                      {tx.id}
                    </div>
                    
                    {/* Client */}
                    <div className="col-span-5 md:col-span-4">
                      <span className={`font-serif text-lg block leading-tight group-hover:text-[#C9A25D] transition-colors ${theme.text}`}>
                        {tx.client || tx.vendor}
                      </span>
                      <span className="text-[10px] text-stone-400 md:hidden block mt-1">{tx.id}</span>
                    </div>

                    {/* Date */}
                    <div className={`col-span-3 hidden md:block text-xs ${theme.subText}`}>
                      {tx.date}
                    </div>

                    {/* Amount (Aligned Right) */}
                    <div className={`col-span-3 md:col-span-2 text-right font-serif text-lg ${tx.type === 'Expense' ? 'text-stone-400' : theme.text}`}>
                      {tx.type === 'Expense' ? '-' : '+'}${tx.amount}
                    </div>

                    {/* Status Badge (Aligned Right) */}
                    <div className="col-span-4 md:col-span-2 flex justify-end items-center gap-4">
                      {renderStatusBadge(tx.status)}
                      <button className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-[#C9A25D] ${theme.subText}`}>
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  </div>
                ))}
                
                {filteredTransactions.length === 0 && (
                   <div className="py-20 text-center">
                      <FileText size={40} strokeWidth={1} className="mx-auto text-stone-300 mb-4" />
                      <p className="font-serif italic text-stone-400">No transactions found.</p>
                   </div>
                )}
              </div>
              
              {/* Footer */}
              <div className="p-6 border-t border-stone-100 dark:border-stone-800 flex justify-between items-center">
                 <span className={`text-[10px] uppercase tracking-widest ${theme.subText}`}>Showing {filteredTransactions.length} entries</span>
                 <div className="flex gap-2">
                    <button className={`px-4 py-1.5 text-[10px] uppercase tracking-wider border ${theme.border} ${theme.subText} hover:text-[#C9A25D] transition-colors disabled:opacity-50`}>Prev</button>
                    <button className={`px-4 py-1.5 text-[10px] uppercase tracking-wider border ${theme.border} hover:bg-[#C9A25D] hover:text-white hover:border-[#C9A25D] transition-colors`}>Next</button>
                 </div>
              </div>

            </div>
          </FadeIn>

        </div>
      </main>
    </div>
  );
};

export default Financials;
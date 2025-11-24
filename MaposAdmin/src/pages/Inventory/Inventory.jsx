// src/pages/Inventory/Inventory.jsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, ArrowUpDown, AlertTriangle, 
  Package, Tag, MoreHorizontal, Download 
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

const Inventory = () => {
  const [darkMode, setDarkMode] = useState(() => {
  return localStorage.getItem('theme') === 'dark';
});

useEffect(() => {
  if (darkMode) {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  } else {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('theme', 'light');
  }
}, [darkMode]);
  // Initialize state based on Local Storage
const [sidebarOpen, setSidebarOpen] = useState(() => {
  const savedState = localStorage.getItem('sidebarState');
  return savedState !== null ? savedState === 'true' : true;
});
  const [activeTab, setActiveTab] = useState('Inventory');
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // --- Theme Logic ---
  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  const theme = {
    bg: darkMode ? 'bg-[#0c0c0c]' : 'bg-[#FAFAFA]',
    cardBg: darkMode ? 'bg-[#141414]' : 'bg-white',
    text: darkMode ? 'text-stone-200' : 'text-stone-900',
    subText: darkMode ? 'text-stone-500' : 'text-stone-500',
    border: darkMode ? 'border-stone-800' : 'border-stone-200',
    accent: 'text-[#C9A25D]',
    accentBg: 'bg-[#C9A25D]',
    hoverBg: darkMode ? 'hover:bg-stone-800' : 'hover:bg-stone-50',
  };

  // --- Mock Data ---
  const inventoryData = [
    { id: 1, name: 'White Truffle Oil', sku: 'ING-001', category: 'Ingredients', quantity: 15, unit: 'Bottles', threshold: 20, lastUpdated: 'Oct 20' },
    { id: 2, name: 'Gold Rim Charger Plates', sku: 'EQP-104', category: 'Equipment', quantity: 145, unit: 'Pcs', threshold: 150, lastUpdated: 'Oct 18' },
    { id: 3, name: 'Basmati Rice (Premium)', sku: 'ING-042', category: 'Ingredients', quantity: 45, unit: 'KG', threshold: 25, lastUpdated: 'Oct 21' },
    { id: 4, name: 'Linen Napkins (Ivory)', sku: 'DEC-201', category: 'Decor', quantity: 300, unit: 'Pcs', threshold: 200, lastUpdated: 'Sep 30' },
    { id: 5, name: 'Saffron Threads', sku: 'ING-099', category: 'Ingredients', quantity: 5, unit: 'Grams', threshold: 10, lastUpdated: 'Oct 22' },
    { id: 6, name: 'Chafing Dish Fuel', sku: 'SUP-301', category: 'Supplies', quantity: 80, unit: 'Cans', threshold: 50, lastUpdated: 'Oct 15' },
    { id: 7, name: 'Wagyu Beef A5', sku: 'ING-500', category: 'Ingredients', quantity: 8, unit: 'KG', threshold: 10, lastUpdated: 'Oct 24' },
  ];

  // Filter Logic
  const filteredItems = inventoryData.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "All" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Stats Calculation
  const lowStockCount = inventoryData.filter(i => i.quantity <= i.threshold).length;
  const totalItems = inventoryData.length;

  return (
    <div className={`flex h-screen w-full overflow-hidden font-sans ${theme.bg} ${theme.text} selection:bg-[#C9A25D] selection:text-white`}>
      
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=Inter:wght@300;400;500&display=swap');
          .font-serif { font-family: 'Cormorant Garamond', serif; }
          .font-sans { font-family: 'Inter', sans-serif; }
          .no-scrollbar::-webkit-scrollbar { display: none; }
        `}
      </style>

      {/* Sidebar */}
      <Sidebar 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        theme={theme} 
      />

      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Navbar */}
        <DashboardNavbar 
          activeTab="Inventory Management"
          theme={theme}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-12 scroll-smooth no-scrollbar">
          
          {/* 1. Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              { label: 'Total SKU Count', value: totalItems, sub: 'Across 4 Categories', icon: Package },
              { label: 'Low Stock Alerts', value: lowStockCount, sub: 'Requires Re-order', icon: AlertTriangle, isAlert: true },
              { label: 'Inventory Value', value: '$42,500', sub: 'Est. Current Asset', icon: Tag },
            ].map((stat, idx) => (
              <FadeIn key={idx} delay={idx * 100}>
                <div className={`p-6 border ${theme.border} ${theme.cardBg} flex items-start justify-between group hover:border-[#C9A25D]/30 transition-all duration-500`}>
                  <div>
                    <span className={`text-[10px] uppercase tracking-[0.2em] ${theme.subText}`}>{stat.label}</span>
                    <h3 className={`font-serif text-4xl mt-2 mb-1 ${stat.isAlert ? 'text-red-400' : theme.text}`}>{stat.value}</h3>
                    <p className="text-xs text-stone-400">{stat.sub}</p>
                  </div>
                  <div className={`p-2 rounded-full ${theme.bg} ${stat.isAlert ? 'text-red-400' : 'text-[#C9A25D]'}`}>
                    <stat.icon size={20} strokeWidth={1} />
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* 2. Main Inventory List */}
          <FadeIn delay={300}>
            <div className={`border ${theme.border} ${theme.cardBg} min-h-[600px]`}>
              
              {/* Header Toolbar */}
              <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-stone-100 dark:border-stone-800">
                <div>
                  <h3 className="font-serif text-2xl italic">Stock Overview</h3>
                  <p className={`text-xs ${theme.subText} mt-1`}>Real-time tracking of assets and ingredients.</p>
                </div>
                
                <div className="flex items-center gap-3">
                  {/* Category Filter Pills */}
                  <div className="hidden md:flex bg-stone-50 dark:bg-stone-900 p-1 rounded-sm border border-stone-200 dark:border-stone-800">
                    {['All', 'Ingredients', 'Equipment', 'Decor'].map(cat => (
                      <button
                        key={cat}
                        onClick={() => setCategoryFilter(cat)}
                        className={`px-4 py-1.5 text-[10px] uppercase tracking-wider transition-all rounded-sm ${
                          categoryFilter === cat 
                          ? 'bg-white dark:bg-stone-800 shadow-sm text-[#C9A25D]' 
                          : 'text-stone-400 hover:text-stone-600'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  <button className="flex items-center gap-2 bg-[#1c1c1c] text-white px-4 py-2.5 text-[10px] uppercase tracking-widest hover:bg-[#C9A25D] transition-colors">
                    <Plus size={14} /> Add Item
                  </button>
                  
                  <button className={`p-2.5 border ${theme.border} hover:text-[#C9A25D] transition-colors`}>
                    <Download size={16} strokeWidth={1} />
                  </button>
                </div>
              </div>

              {/* --- UPDATED TABLE HEADER (MATCHES FINANCE PAGE STYLE) --- */}
              <div className={`
                grid grid-cols-12 gap-4 px-8 py-4 
                border-b ${theme.border} 
                text-[10px] uppercase tracking-[0.2em] font-medium text-stone-400 select-none
              `}>
                <div className="col-span-4 md:col-span-3 flex items-center gap-2 cursor-pointer hover:text-[#C9A25D] transition-colors">
                  Item Name <ArrowUpDown size={10} className="opacity-70"/>
                </div>
                <div className="col-span-2 hidden md:block">SKU</div>
                <div className="col-span-2 hidden md:block">Category</div>
                <div className="col-span-4 md:col-span-3">Stock Level</div>
                <div className="col-span-2 text-right">Status</div>
              </div>

              {/* Table Rows */}
              <div className={`divide-y ${darkMode ? 'divide-stone-800' : 'divide-stone-100'}`}>
                {filteredItems.map((item) => {
                  const percentage = Math.min((item.quantity / (item.threshold * 2)) * 100, 100);
                  const isLow = item.quantity <= item.threshold;
                  
                  return (
                    <div 
                      key={item.id} 
                      className={`grid grid-cols-12 gap-4 px-8 py-5 items-center group ${theme.hoverBg} transition-colors duration-300`}
                    >
                      {/* Name */}
                      <div className="col-span-4 md:col-span-3">
                        <span className={`font-serif text-lg block leading-tight group-hover:text-[#C9A25D] transition-colors ${theme.text}`}>{item.name}</span>
                        <span className="text-[10px] text-stone-400 md:hidden block">{item.sku}</span>
                      </div>

                      {/* SKU */}
                      <div className={`col-span-2 hidden md:block text-xs ${theme.subText} font-mono tracking-wider`}>{item.sku}</div>

                      {/* Category */}
                      <div className="col-span-2 hidden md:block">
                        <span className={`text-[10px] uppercase tracking-wider px-2 py-1 border rounded-sm ${theme.border} text-stone-500`}>
                          {item.category}
                        </span>
                      </div>

                      {/* Stock Visualizer */}
                      <div className="col-span-4 md:col-span-3">
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className={isLow ? 'text-red-400 font-bold' : theme.text}>
                            {item.quantity} <span className="text-[10px] text-stone-400 font-normal">{item.unit}</span>
                          </span>
                          <span className="text-[10px] text-stone-400">Min: {item.threshold}</span>
                        </div>
                        <div className={`w-full h-1.5 ${darkMode ? 'bg-stone-800' : 'bg-stone-200'} rounded-full overflow-hidden`}>
                          <div 
                            className={`h-full rounded-full transition-all duration-1000 ${
                              isLow ? 'bg-red-400' : 'bg-[#C9A25D]'
                            }`} 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Status & Action */}
                      <div className="col-span-4 md:col-span-2 flex justify-end items-center gap-4">
                        {isLow ? (
                          <span className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-red-500 bg-red-500/10 px-3 py-1.5 rounded-sm font-medium">
                            <AlertTriangle size={10} /> Low
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-emerald-600 bg-emerald-500/10 px-3 py-1.5 rounded-sm font-medium">
                            In Stock
                          </span>
                        )}
                        <button className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-[#C9A25D] ${theme.subText}`}>
                          <MoreHorizontal size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {filteredItems.length === 0 && (
                   <div className="py-20 text-center">
                      <Package size={40} strokeWidth={1} className="mx-auto text-stone-300 mb-4" />
                      <p className="font-serif italic text-stone-400">No inventory items found.</p>
                   </div>
                )}
              </div>
              
              {/* Footer Pagination */}
              <div className="p-6 border-t border-stone-100 dark:border-stone-800 flex justify-between items-center">
                 <span className={`text-[10px] uppercase tracking-widest ${theme.subText}`}>Showing {filteredItems.length} items</span>
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

export default Inventory;
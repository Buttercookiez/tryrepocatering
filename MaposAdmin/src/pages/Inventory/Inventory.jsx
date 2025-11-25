// src/pages/Inventory/Inventory.jsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, ArrowUpDown, AlertTriangle, 
  Package, Tag, MoreHorizontal, Download, X, ChevronDown
} from 'lucide-react';

// --- FIXED IMPORTS ---
import Sidebar from '../../components/layout/Sidebar';
import DashboardNavbar from '../../components/layout/Navbar';

// --- 1. ANIMATION COMPONENT ---
const FadeIn = ({ children, delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const currentRef = ref.current;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.1 }
    );
    if (currentRef) observer.observe(currentRef);
    return () => { if (currentRef) observer.unobserve(currentRef); };
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

// --- 2. NEW ITEM MODAL (Matches Theme & Requirements) ---
const NewItemModal = ({ isOpen, onClose, onSave, theme, categories }) => {
  const [formData, setFormData] = useState({
    name: '', category: '', quantity: '', unit: 'Pcs', threshold: ''
  });
  
  // State for Custom Category Dropdown
  const [categoryOpen, setCategoryOpen] = useState(false);

  const inputBase = `w-full bg-transparent border-b ${theme.border} py-3 pl-0 text-sm ${theme.text} placeholder-stone-400 focus:outline-none focus:border-[#C9A25D] transition-colors`;
  const dropdownContainer = `absolute top-full left-0 w-full mt-1 p-2 shadow-xl rounded-sm z-50 transition-all duration-300 origin-top border ${theme.border} ${theme.cardBg} max-h-48 overflow-y-auto no-scrollbar`;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.quantity) return; 

    const newItem = {
      id: Date.now(),
      name: formData.name,
      // Auto-generated SKU/Code
      sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`, 
      category: formData.category || 'Miscellaneous',
      quantity: Number(formData.quantity),
      unit: formData.unit,
      threshold: Number(formData.threshold),
      lastUpdated: 'Just Now'
    };
    onSave(newItem);
    onClose();
    setFormData({ name: '', category: '', quantity: '', unit: 'Pcs', threshold: '' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className={`w-full max-w-xl ${theme.cardBg} rounded-sm shadow-2xl border ${theme.border} flex flex-col`}>
        
        {/* Header */}
        <div className={`p-8 border-b ${theme.border} flex justify-between items-center sticky top-0 ${theme.cardBg} z-20`}>
          <div>
            <h2 className={`font-serif text-3xl ${theme.text}`}>Add Inventory Item</h2>
            <p className={`text-xs ${theme.subText} mt-1`}>Register new equipment or supplies.</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors text-stone-500"><X size={20}/></button>
        </div>
        
        {/* Body */}
        <div className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Item Name (Full Width) */}
            <div className="md:col-span-2">
              <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Item Name" className={inputBase} />
            </div>
            
            {/* Custom Category Dropdown (Aligned UI) */}
            <div className="relative md:col-span-2">
               <button 
                 type="button" 
                 onClick={() => setCategoryOpen(!categoryOpen)} 
                 className={`${inputBase} text-left flex items-center justify-between cursor-pointer`}
               >
                  <span className={formData.category ? theme.text : "text-stone-400"}>
                    {formData.category || "Select Category"}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform duration-300 ${categoryOpen ? 'rotate-180' : ''}`} />
               </button>
               
               <div className={`${dropdownContainer} ${categoryOpen ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0 pointer-events-none'}`}>
                  <div className="flex flex-col gap-1">
                     {categories.filter(c => c !== 'All').map(cat => (
                        <div 
                          key={cat} 
                          onClick={() => { 
                            setFormData(prev => ({...prev, category: cat})); 
                            setCategoryOpen(false); 
                          }} 
                          className={`text-xs p-2 hover:bg-[#C9A25D] hover:text-white cursor-pointer transition-colors rounded-sm ${theme.text}`}
                        >
                          {cat}
                        </div>
                     ))}
                  </div>
               </div>
            </div>

            {/* Quantity (Simple Number Input) */}
            <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} placeholder="Current Stock" className={inputBase} />
            
            {/* Unit & Threshold (Simple Number Inputs) */}
            <div className="flex gap-4">
               <input type="text" name="unit" value={formData.unit} onChange={handleChange} placeholder="Unit (e.g. Pcs)" className={`${inputBase} w-1/3`} />
               <input type="number" name="threshold" value={formData.threshold} onChange={handleChange} placeholder="Low Stock Threshold" className={`${inputBase} w-2/3`} />
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className={`p-6 border-t ${theme.border} flex justify-end gap-4`}>
          <button onClick={onClose} className={`px-6 py-3 text-xs uppercase tracking-widest border ${theme.border} ${theme.text} hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors`}>Cancel</button>
          <button onClick={handleSubmit} className="px-8 py-3 bg-[#1c1c1c] text-white text-xs uppercase tracking-widest hover:bg-[#C9A25D] transition-colors rounded-sm shadow-lg">Save Item</button>
        </div>
      </div>
    </div>
  );
};

// --- 3. MAIN COMPONENT ---
const Inventory = () => {
  // --- Persistence Logic ---
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const savedState = localStorage.getItem('sidebarState');
    return savedState !== null ? JSON.parse(savedState) : true;
  });

  const [activeTab, setActiveTab] = useState('Inventory');
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  
  // Modal State
  const [isNewItemOpen, setIsNewItemOpen] = useState(false);

  // --- Effects ---
  useEffect(() => {
    localStorage.setItem('sidebarState', JSON.stringify(sidebarOpen));
  }, [sidebarOpen]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

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

  // --- Categories ---
  const categories = [
    "All", "Furniture", "Linens", "Dining", "Equipment", "Decorations", "Structures", "Miscellaneous"
  ];

  // --- Inventory Data (Converted to State for Adding Items) ---
  const [inventoryData, setInventoryData] = useState([
    { id: 1, name: 'Tiffany Chairs (Gold)', sku: 'FUR-001', category: 'Furniture', quantity: 145, unit: 'Pcs', threshold: 150, lastUpdated: 'Oct 20' },
    { id: 2, name: 'White Satin Tablecloth', sku: 'LIN-104', category: 'Linens', quantity: 300, unit: 'Pcs', threshold: 50, lastUpdated: 'Oct 18' },
    { id: 3, name: 'Silver Cutlery Set', sku: 'DIN-042', category: 'Dining', quantity: 500, unit: 'Sets', threshold: 100, lastUpdated: 'Oct 21' },
    { id: 4, name: 'Chafing Dishes', sku: 'EQP-201', category: 'Equipment', quantity: 25, unit: 'Units', threshold: 30, lastUpdated: 'Sep 30' },
    { id: 5, name: 'Crystal Centerpieces', sku: 'DEC-099', category: 'Decorations', quantity: 40, unit: 'Pcs', threshold: 45, lastUpdated: 'Oct 22' },
    { id: 6, name: 'Garden Tent (20x20)', sku: 'STR-301', category: 'Structures', quantity: 5, unit: 'Units', threshold: 2, lastUpdated: 'Oct 15' },
    { id: 7, name: 'Extension Cords (Heavy)', sku: 'MSC-500', category: 'Miscellaneous', quantity: 12, unit: 'Pcs', threshold: 15, lastUpdated: 'Oct 24' },
    { id: 8, name: 'Round Tables (10-Seater)', sku: 'FUR-002', category: 'Furniture', quantity: 50, unit: 'Pcs', threshold: 10, lastUpdated: 'Oct 25' },
  ]);

  // Function to add new item
  const handleSaveItem = (newItem) => {
    setInventoryData(prev => [newItem, ...prev]);
  };

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
              { label: 'Total Asset Count', value: totalItems, sub: 'Across 7 Categories', icon: Package },
              { label: 'Low Stock Alerts', value: lowStockCount, sub: 'Requires Re-order', icon: AlertTriangle, isAlert: true },
              { label: 'Total Asset Value', value: '$142,500', sub: 'Est. Current Value', icon: Tag },
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
              <div className="p-6 md:p-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-stone-100 dark:border-stone-800">
                <div>
                  <h3 className="font-serif text-2xl italic">Asset Overview</h3>
                  <p className={`text-xs ${theme.subText} mt-1`}>Real-time tracking of equipment and supplies.</p>
                </div>
                
                {/* Filter & Actions Group */}
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full lg:w-auto">
                  
                  {/* Kitchen-style Filter Pills */}
                  <div className={`flex flex-wrap gap-1 p-1 rounded-sm border ${theme.border} ${darkMode ? 'bg-stone-900' : 'bg-stone-50'}`}>
                    {categories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setCategoryFilter(cat)}
                        className={`
                          px-3 py-1.5 text-[10px] uppercase tracking-wider transition-all rounded-sm
                          ${categoryFilter === cat 
                            ? 'bg-[#C9A25D] text-white shadow-sm' 
                            : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-300'
                          }
                        `}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    {/* ADD ITEM BUTTON */}
                    <button 
                      onClick={() => setIsNewItemOpen(true)}
                      className="flex items-center gap-2 bg-[#1c1c1c] text-white px-4 py-2.5 text-[10px] uppercase tracking-widest hover:bg-[#C9A25D] transition-colors"
                    >
                        <Plus size={14} /> Add Item
                    </button>
                    
                    <button className={`p-2.5 border ${theme.border} hover:text-[#C9A25D] transition-colors`}>
                        <Download size={16} strokeWidth={1} />
                    </button>
                  </div>
                </div>
              </div>

              {/* TABLE HEADER */}
              <div className={`
                grid grid-cols-12 gap-4 px-8 py-5 
                border-y ${theme.border} 
                ${darkMode ? 'bg-[#1c1c1c] text-stone-400' : 'bg-stone-100 text-stone-600'} 
                text-[11px] uppercase tracking-[0.2em] font-semibold
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
              <div className={`divide-y divide-stone-100 dark:divide-stone-800`}>
                {filteredItems.map((item) => {
                  const percentage = Math.min((item.quantity / (item.threshold * 2)) * 100, 100);
                  const isLow = item.quantity <= item.threshold;
                  
                  return (
                    <div 
                      key={item.id} 
                      className={`grid grid-cols-12 gap-4 px-8 py-5 items-center group ${theme.hoverBg} transition-colors`}
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
                      <p className="font-serif italic text-stone-400">No items found in {categoryFilter}.</p>
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

      {/* --- 4. RENDER MODAL --- */}
      <NewItemModal 
         isOpen={isNewItemOpen} 
         onClose={() => setIsNewItemOpen(false)} 
         onSave={handleSaveItem}
         theme={theme}
         categories={categories}
      />
    </div>
  );
};

export default Inventory;
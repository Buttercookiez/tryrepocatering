import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Calendar, Users, MapPin, 
  Utensils, Minus, Plus, 
  AlertTriangle, CheckCircle, Circle, 
  Clock, X, ChevronDown, Layers, Check
} from 'lucide-react';

// --- IMPORT YOUR API INSTANCE ---
import api from '../../api/api'; 

import Sidebar from '../../components/layout/Sidebar';
import DashboardNavbar from '../../components/layout/Navbar';
import { KitchenSkeleton } from '../../components/SkeletonLoaders';

// --- HELPER COMPONENTS ---
const FadeIn = ({ children, delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setIsVisible(true); }, { threshold: 0.1 });
    if (ref.current) observer.observe(ref.current);
  }, []);
  return <div ref={ref} className={`transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
};

const SuccessToast = ({ message, show, onClose }) => {
    if (!show) return null;
    return (
        <div className="fixed bottom-6 right-6 z-[10000] animate-in slide-in-from-bottom-5 fade-in duration-300">
            <div className="bg-white dark:bg-[#1c1c1c] border-l-4 border-emerald-500 shadow-2xl rounded-sm p-4 flex items-center gap-4 min-w-[300px]">
                <div className="bg-emerald-500/10 p-2 rounded-full"><Check size={20} className="text-emerald-500" /></div>
                <div><h4 className="text-sm font-bold text-stone-800 dark:text-stone-100 uppercase tracking-wider">Success</h4><p className="text-xs text-stone-500 dark:text-stone-400">{message}</p></div>
                <button onClick={onClose} className="ml-auto text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"><X size={14} /></button>
            </div>
        </div>
    );
};

const CustomDropdown = ({ label, options, value, onChange, theme }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    useEffect(() => {
        function handleClickOutside(event) { if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false); }
        document.addEventListener("mousedown", handleClickOutside); return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    return (
        <div className="relative" ref={dropdownRef}>
            <label className="text-[10px] uppercase tracking-widest text-stone-400 mb-1 block">{label}</label>
            <div onClick={() => setIsOpen(!isOpen)} className={`w-full bg-transparent border-b ${theme.border} py-2 text-sm cursor-pointer flex justify-between items-center hover:border-[#C9A25D] transition-colors ${theme.text}`}><span>{value}</span><ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} /></div>
            {isOpen && <div className={`absolute top-full left-0 w-full z-50 max-h-40 overflow-y-auto ${theme.cardBg} border ${theme.border} shadow-xl mt-1 custom-scrollbar`}>{options.map((option) => <div key={option} onClick={() => { onChange(option); setIsOpen(false); }} className={`px-4 py-2 text-sm cursor-pointer hover:bg-[#C9A25D] hover:text-white transition-colors ${theme.text}`}>{option}</div>)}</div>}
        </div>
    );
};

const AddIngredientModal = ({ isOpen, onClose, onSave, theme }) => {
    const [formData, setFormData] = useState({ name: '', unit: 'kg', category: 'Pantry', current: 0, max: 100 });
    if (!isOpen) return null;
    const handleSubmit = () => { if (!formData.name) return; onSave({ ...formData, current: Number(formData.current), max: Number(formData.max) }); setFormData({ name: '', unit: 'kg', category: 'Pantry', current: 0, max: 100 }); onClose(); };
    const inputClass = `w-full bg-transparent border-b ${theme.border} py-2 text-sm focus:outline-none focus:border-[#C9A25D] ${theme.text}`;
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className={`w-full max-w-md ${theme.cardBg} rounded-sm shadow-2xl border ${theme.border} p-8 relative`}>
                <button onClick={onClose} className="absolute top-4 right-4 text-stone-400 hover:text-red-500"><X size={20}/></button>
                <h2 className={`font-serif text-2xl ${theme.text} mb-6`}>Add New Ingredient</h2>
                <div className="space-y-6">
                    <div><label className="text-[10px] uppercase tracking-widest text-stone-400">Ingredient Name</label><input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className={inputClass} placeholder="e.g. Saffron" /></div>
                    <div><CustomDropdown label="Category" options={['Meat', 'Seafood', 'Produce', 'Dairy', 'Pantry', 'Spices', 'Misc']} value={formData.category} onChange={(val) => setFormData({...formData, category: val})} theme={theme} /></div>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-1"><CustomDropdown label="Unit" options={['kg', 'g', 'L', 'ml', 'pcs', 'btl', 'pk', 'bnch']} value={formData.unit} onChange={(val) => setFormData({...formData, unit: val})} theme={theme} /></div>
                        <div className="col-span-1"><label className="text-[10px] uppercase tracking-widest text-stone-400">Current</label><input type="number" value={formData.current} onChange={e => setFormData({...formData, current: Number(e.target.value)})} className={inputClass} /></div>
                        <div className="col-span-1"><label className="text-[10px] uppercase tracking-widest text-stone-400">Max Cap</label><input type="number" value={formData.max} onChange={e => setFormData({...formData, max: Number(e.target.value)})} className={inputClass} /></div>
                    </div>
                </div>
                <div className="mt-8 flex justify-end gap-3"><button onClick={onClose} className={`px-4 py-2 text-xs uppercase tracking-widest border ${theme.border} ${theme.text} hover:bg-stone-100 dark:hover:bg-stone-800`}>Cancel</button><button onClick={handleSubmit} className="px-6 py-2 bg-[#1c1c1c] text-white text-xs uppercase tracking-widest hover:bg-[#C9A25D] transition-colors rounded-sm">Save Item</button></div>
            </div>
        </div>
    );
};

const VisualStockBar = ({ current, max }) => {
    const percentage = Math.min(100, Math.max(0, (current / max) * 100));
    let colorClass = "bg-stone-400"; let textClass = "text-stone-400";
    if (percentage <= 25) { colorClass = "bg-red-400"; textClass = "text-red-400"; } 
    else if (percentage <= 50) { colorClass = "bg-[#C9A25D]"; textClass = "text-[#C9A25D]"; }
    return (
        <div className="w-full flex flex-col justify-center h-full">
            <div className="relative w-full">
                <div className="flex justify-between absolute -top-5 w-full text-[10px] font-bold tracking-widest uppercase"><span className={`${textClass}`}>{percentage < 30 ? 'Low Stock' : percentage < 70 ? 'Mid Stock' : 'Good'}</span><span className={`${textClass}`}>{Math.round(percentage)}%</span></div>
                <div className="w-full h-1.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden"><div className={`h-full ${colorClass} transition-all duration-700 ease-out rounded-full`} style={{ width: `${percentage}%` }} /></div>
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---
const Kitchen = () => {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const savedState = localStorage.getItem('sidebarState');
    return savedState !== null ? savedState === 'true' : true;
  });
  
  const [activeTab, setActiveTab] = useState('Inventory'); 
  const [searchQuery, setSearchQuery] = useState("");
  const [deductedItems, setDeductedItems] = useState([]); 
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "" });
  
  const [isLoading, setIsLoading] = useState(true);
  const [ingredients, setIngredients] = useState([]);
  const [todaysPackages, setTodaysPackages] = useState([]);
  
  const [packageMenus, setPackageMenus] = useState({}); 

  const getTodayString = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1);
    const day = String(date.getDate()); 
    return `${month}/${day}/${year}`;
  };
  const todaysDateDisplay = getTodayString(); 

  // --- 1. FETCH INVENTORY ---
  const fetchInventory = async () => {
      try {
          // FIX: Use api.get
          const res = await api.get('/kitchen/inventory');
          const data = res.data;
          if (Array.isArray(data)) setIngredients(data);
          else setIngredients([]);
      } catch (err) { console.error("Inventory Error:", err); setIngredients([]); } 
  };

  // --- 2. FETCH MENUS ---
  const fetchMenus = async () => {
      try {
          // FIX: Use api.get
          const res = await api.get('/kitchen/menus');
          setPackageMenus(res.data);
      } catch (err) { console.error("Menu Error:", err); }
  };

  // --- 3. FETCH ORDERS ---
  const fetchOrders = async () => {
      try {
          // FIX: Use api.get with params
          const res = await api.get('/kitchen/orders', {
             params: { date: todaysDateDisplay }
          });
          setTodaysPackages(res.data);
      } catch (err) { console.error("Orders Error:", err); }
  };

  useEffect(() => {
      const loadAll = async () => {
          setIsLoading(true);
          await Promise.all([fetchInventory(), fetchMenus(), fetchOrders()]);
          setIsLoading(false);
      };
      loadAll();
  }, []);

  useEffect(() => {
    if (darkMode) { document.documentElement.classList.add('dark'); localStorage.setItem('theme', 'dark'); }
    else { document.documentElement.classList.remove('dark'); localStorage.setItem('theme', 'light'); }
  }, [darkMode]);

  const theme = { bg: darkMode ? 'bg-[#0c0c0c]' : 'bg-[#FAFAFA]', cardBg: darkMode ? 'bg-[#141414]' : 'bg-white', text: darkMode ? 'text-stone-200' : 'text-stone-900', subText: darkMode ? 'text-stone-500' : 'text-stone-500', border: darkMode ? 'border-stone-800' : 'border-stone-300', hoverBg: 'hover:bg-[#C9A25D]/5' };

  // --- 4. ADD INGREDIENT (POST) ---
  const handleAddIngredient = async (newItem) => {
    try {
        // FIX: Use api.post
        await api.post('/kitchen/inventory', newItem);
        
        await fetchInventory(); 
        setToast({ show: true, message: `${newItem.name} added.` });
        setTimeout(() => setToast({ show: false, message: "" }), 3000);
    } catch (err) { alert("Error adding item."); }
  };
  
  // --- 5. UPDATE INGREDIENT (PUT) ---
  const handleDeduct = async (uniqueKey, ingredientName, amount) => {
      if (deductedItems.includes(uniqueKey)) return;
      const targetIngredient = ingredients.find(i => i.name === ingredientName);
      if (targetIngredient) {
          const newAmount = Math.max(0, targetIngredient.current - amount);
          try {
              // FIX: Use api.put
              await api.put(`/kitchen/inventory/${targetIngredient.id}`, { current: newAmount });
              
              setIngredients(prev => prev.map(item => item.id === targetIngredient.id ? { ...item, current: newAmount } : item));
              setDeductedItems(prev => [...prev, uniqueKey]);
          } catch (err) { console.error(err); }
      }
  };

  const handleManualInput = async (id, value) => {
      const num = parseFloat(value) || 0;
      setIngredients(prev => prev.map(item => item.id === id ? { ...item, current: num } : item));
      try { 
          // FIX: Use api.put
          await api.put(`/kitchen/inventory/${id}`, { current: num }); 
      } catch (err) { console.error(err); }
  };

  const handleIncrement = async (id, amount) => {
    const item = ingredients.find(i => i.id === id);
    if(item) {
        const newVal = Math.max(0, item.current + amount);
        setIngredients(prev => prev.map(i => i.id === id ? { ...i, current: newVal } : i));
        try { 
            // FIX: Use api.put
            await api.put(`/kitchen/inventory/${id}`, { current: newVal });
        } catch (err) { console.error(err); }
    }
  };

  const getFilteredAndGroupedIngredients = () => {
    if (!ingredients || !Array.isArray(ingredients)) return {};
    const filtered = ingredients.filter(i => i.name && i.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const grouped = filtered.reduce((acc, item) => {
        const cat = item.category || 'Uncategorized';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(item);
        return acc;
    }, {});
    return grouped;
  };

  const groupedInventory = getFilteredAndGroupedIngredients();
  const sortedCategories = Object.keys(groupedInventory).sort();

  return (
    <div className={`flex h-screen w-full overflow-hidden font-sans ${theme.bg} ${theme.text} selection:bg-[#C9A25D] selection:text-white`}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=Inter:wght@300;400;500&display=swap'); .font-serif { font-family: 'Cormorant Garamond', serif; } .font-sans { font-family: 'Inter', sans-serif; } .no-scrollbar::-webkit-scrollbar { display: none; } .custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #57534e; border-radius: 2px; } .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #C9A25D; } input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; } input[type=number] { -moz-appearance: textfield; }`}</style>
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} theme={theme} />
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <DashboardNavbar activeTab="Kitchen Inventory & Menu" theme={theme} darkMode={darkMode} setDarkMode={setDarkMode} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

        {isLoading ? ( <KitchenSkeleton theme={theme} darkMode={darkMode} /> ) : (
            <>
                <div className={`px-6 md:px-12 pt-8 pb-4 flex flex-col`}>
                    <div className="flex justify-between items-end mb-8">
                        <div><h2 className={`font-serif text-3xl italic ${theme.text}`}>Kitchen Operations</h2><p className={`text-xs mt-1 ${theme.subText}`}>Manage stocks and view today's active menus.</p></div>
                        <div className="flex gap-4">
                            {activeTab === 'Inventory' && (<button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 bg-[#1c1c1c] text-white px-6 py-2 text-[10px] uppercase tracking-widest hover:bg-[#C9A25D] transition-colors rounded-sm shadow-lg"><Plus size={14} /> Add Ingredient</button>)}
                            <div className={`flex border ${theme.border} rounded-sm p-1 ${theme.cardBg}`}>{['Inventory', 'Packages'].map(tab => (<button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-2 text-[10px] uppercase tracking-widest transition-all rounded-sm ${activeTab === tab ? 'bg-[#1c1c1c] text-white shadow-md' : `${theme.subText} hover:text-[#C9A25D]`}`}>{tab}</button>))}</div>
                        </div>
                    </div>
                </div>
                <div className="flex-1 overflow-x-hidden overflow-y-auto px-6 md:px-12 pb-12 no-scrollbar">
                    <FadeIn>
                        {activeTab === 'Inventory' && (
                            <div className={`border ${theme.border} ${theme.cardBg} rounded-sm overflow-hidden`}>
                                <div className={`grid grid-cols-12 gap-6 px-8 py-4 border-b ${theme.border} bg-[#C9A25D]/10 text-[10px] uppercase tracking-widest font-bold text-stone-500`}><div className="col-span-4 flex items-center">Ingredient Name</div><div className="col-span-5 flex items-center">Stock Level</div><div className="col-span-3 text-right flex items-center justify-end">Adjustment</div></div>
                                <div className={`divide-y ${darkMode ? 'divide-stone-800' : 'divide-stone-100'}`}>
                                    {sortedCategories.length > 0 ? sortedCategories.map(category => (
                                        <React.Fragment key={category}>
                                            <div className={`px-8 py-3 border-y ${theme.border} flex items-center gap-2 bg-transparent`}><Layers size={14} className="text-[#C9A25D]" /><span className="text-xs font-bold uppercase tracking-widest text-stone-400">{category}</span></div>
                                            {groupedInventory[category].map((item) => (
                                                <div key={item.id} className={`grid grid-cols-12 gap-6 px-8 py-6 items-center group ${theme.hoverBg} transition-colors`}><div className="col-span-4 flex flex-col justify-center"><p className={`font-serif text-lg ${theme.text} leading-tight`}>{item.name}</p><p className="text-[10px] text-[#C9A25D] mt-1 font-sans font-medium">Per {item.unit}</p></div><div className="col-span-5 pr-4"><VisualStockBar current={item.current} max={item.max} theme={theme} /></div><div className="col-span-3 flex justify-end items-center gap-3"><button onClick={() => handleIncrement(item.id, -1)} className={`w-8 h-8 flex items-center justify-center border ${theme.border} rounded-sm hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 transition-colors`}><Minus size={14} /></button><div className="relative"><input type="number" value={item.current} onChange={(e) => handleManualInput(item.id, e.target.value)} className={`w-16 text-center bg-transparent border-b ${theme.border} py-1 text-base font-serif focus:border-[#C9A25D] focus:outline-none ${theme.text}`} /><span className="absolute -top-3 left-0 w-full text-center text-[8px] text-stone-400 uppercase">Qty</span></div><button onClick={() => handleIncrement(item.id, 1)} className={`w-8 h-8 flex items-center justify-center border ${theme.border} rounded-sm hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 transition-colors`}><Plus size={14} /></button></div></div>
                                            ))}
                                        </React.Fragment>
                                    )) : (<div className="p-8 text-center text-stone-400 text-sm">No ingredients found.</div>)}
                                </div>
                            </div>
                        )}
                        {activeTab === 'Packages' && (
                            <div className="space-y-12">
                                <div className="flex items-center gap-3 mb-6"><Calendar size={18} className="text-[#C9A25D]" /><h3 className={`font-serif text-2xl ${theme.text}`}>Menu for Today <span className="text-stone-400 italic text-lg">({todaysDateDisplay})</span></h3></div>
                                {todaysPackages.length === 0 ? (<div className={`p-12 text-center border border-dashed ${theme.border} rounded-sm`}><p className={theme.subText}>No active packages booked for {todaysDateDisplay}.</p></div>) : (
                                    <div className="grid grid-cols-1 gap-12">
                                        {todaysPackages.map((booking) => {
                                            const menu = packageMenus[booking.packageId] || { name: "Standard Package", items: [] };
                                            return (
                                                <div key={booking.id} className={`border ${theme.border} ${theme.cardBg} rounded-sm overflow-hidden flex flex-col md:flex-row shadow-sm h-[600px]`}>
                                                    <div className="w-full md:w-80 flex-shrink-0 border-r border-stone-200 dark:border-stone-800 flex flex-col">
                                                        <div className="p-8 border-b border-stone-100 dark:border-stone-800 bg-[#C9A25D]/5"><span className="text-[10px] uppercase tracking-widest text-[#C9A25D] font-bold block mb-2">Selected Package</span><h4 className={`font-serif text-3xl ${theme.text}`}>{menu.name}</h4><div className="mt-4 flex items-center gap-2 text-xs text-stone-500"><Clock size={14} /> {booking.time}</div></div>
                                                        <div className={`p-8 flex-1 ${theme.cardBg} flex flex-col justify-center`}><div className="space-y-8"><div><p className="text-[10px] uppercase tracking-widest text-stone-400 mb-2 flex items-center gap-2"><Users size={12}/> Client (Who)</p><p className={`text-xl font-serif ${theme.text}`}>{booking.client}</p><p className={`text-xs ${theme.subText} mt-1`}>{booking.guests} Guests</p></div><div className={`w-full h-[1px] ${theme.border} border-t border-dashed`}></div><div><p className="text-[10px] uppercase tracking-widest text-stone-400 mb-2 flex items-center gap-2"><MapPin size={12}/> Venue (Where)</p><p className={`text-lg font-serif ${theme.text}`}>{booking.venue}</p><p className={`text-xs ${theme.subText} mt-1`}>{booking.type}</p></div></div></div>
                                                    </div>
                                                    <div className="flex-1 p-8 flex flex-col min-w-0">
                                                        <div className="flex justify-between items-center mb-6 flex-shrink-0"><p className="text-[10px] uppercase tracking-widest text-stone-400">Course Breakdown & Ingredients</p><p className="text-[10px] uppercase tracking-widest text-red-400 flex items-center gap-1"><AlertTriangle size={10}/> Tap circle to deduct stock</p></div>
                                                        <div className="overflow-y-auto custom-scrollbar pr-4 space-y-6 flex-1">
                                                            {menu.items && menu.items.map((dish, idx) => (
                                                                <div key={idx} className={`border ${theme.border} rounded-sm p-5`}>
                                                                    <h5 className={`font-serif text-xl ${theme.text} mb-4 flex items-center gap-2`}><Utensils size={14} className="text-[#C9A25D]" /> {dish.name}</h5>
                                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                                        {dish.ingredients.map((ing, i) => {
                                                                            const uniqueKey = `${booking.id}-${idx}-${ing.name}`; const isDeducted = deductedItems.includes(uniqueKey); const stockItem = ingredients.find(inv => inv.name === ing.name); const isCritical = stockItem && stockItem.current < ing.needed;
                                                                            return (<div key={i} className={`flex items-center justify-between p-4 rounded-sm border transition-all duration-300 shadow-sm bg-transparent ${isDeducted ? 'border-emerald-500/30' : `border-stone-200 hover:border-[#C9A25D] dark:border-[#C9A25D]/50 dark:hover:border-[#C9A25D]`}`}><div className="flex flex-col"><span className={`text-xs font-bold ${isDeducted ? 'text-emerald-500 line-through' : theme.text}`}>{ing.name}</span><span className="text-[10px] text-stone-400 mt-1">Required: {ing.needed} {stockItem?.unit || ''}</span>{isCritical && !isDeducted && <span className="text-[9px] text-red-500 font-bold uppercase mt-1">Insufficient Stock</span>}</div><button onClick={() => handleDeduct(uniqueKey, ing.name, ing.needed)} disabled={isDeducted} className={`transition-all duration-300 transform active:scale-90 ${isDeducted ? 'text-emerald-500' : 'text-stone-300 hover:text-[#C9A25D]'}`}>{isDeducted ? <CheckCircle size={22} fill="currentColor" className="text-emerald-900/20"/> : <Circle size={22} strokeWidth={1.5} />}</button></div>);
                                                                        })}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </FadeIn>
                </div>
            </>
        )}
        <SuccessToast show={toast.show} message={toast.message} onClose={() => setToast({ ...toast, show: false })} />
        <AddIngredientModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSave={handleAddIngredient} theme={theme} />
      </main>
    </div>
  );
};

export default Kitchen;
import React, { useState, useEffect } from 'react';
import { 
  Edit3, Save, Utensils, LayoutGrid, ChevronDown, Plus, Trash2, Check, X 
} from 'lucide-react';

import Sidebar from '../../components/layout/Sidebar';
import DashboardNavbar from '../../components/layout/Navbar';

const API_BASE = 'http://localhost:5000/api/kitchen';

// --- 1. SUCCESS TOAST COMPONENT (THEME ALIGNED) ---
const SuccessToast = ({ message, show, onClose }) => {
    if (!show) return null;
    return (
        <div className="fixed bottom-10 right-10 z-[10000] animate-in slide-in-from-right-10 fade-in duration-500">
            <div className="bg-white dark:bg-[#181818] border border-stone-200 dark:border-stone-800 border-l-[6px] border-l-[#C9A25D] rounded-r-sm shadow-2xl p-6 flex items-start gap-5 min-w-[350px]">
                
                {/* Icon */}
                <div className="bg-[#C9A25D] rounded-full p-2 shrink-0 shadow-lg shadow-[#C9A25D]/20">
                    <Check size={20} className="text-white" strokeWidth={3} />
                </div>

                {/* Content */}
                <div className="flex-1">
                    <h4 className="text-base font-serif font-bold text-stone-800 dark:text-white leading-none mb-1.5 tracking-wide">
                        System Update
                    </h4>
                    <p className="text-sm text-stone-500 dark:text-stone-400 leading-snug">
                        {message}
                    </p>
                </div>

                {/* Close Button */}
                <button 
                    onClick={onClose} 
                    className="text-stone-300 hover:text-stone-500 dark:hover:text-white transition-colors -mt-1 -mr-1"
                >
                    <X size={18} />
                </button>
            </div>
        </div>
    );
};

const MenuManagement = () => {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('sidebarState');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [isLoading, setIsLoading] = useState(true);
  const [packages, setPackages] = useState([]);
  const [editingPkg, setEditingPkg] = useState(null); 
  
  // Toast State
  const [toast, setToast] = useState({ show: false, message: "" });

  useEffect(() => { localStorage.setItem('sidebarState', JSON.stringify(sidebarOpen)); }, [sidebarOpen]);

  // --- FETCH ---
  const fetchPackages = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/menus`);
      const data = await res.json();
      const pkgArray = Array.isArray(data) ? data : Object.values(data);
      pkgArray.sort((a, b) => a.price - b.price);
      setPackages(pkgArray); 
    } catch (err) { console.error("Fetch Error:", err); } 
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchPackages(); }, []);

  // --- SAVE ---
  const handleSave = async () => {
    if (!editingPkg || !editingPkg.id) {
        setToast({ show: true, message: "Error: Missing Package ID." });
        return;
    }

    try {
      const res = await fetch(`${API_BASE}/menus/${editingPkg.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingPkg)
      });

      if (!res.ok) throw new Error("Failed to update");

      setToast({ show: true, message: "Package updated successfully!" });
      setTimeout(() => setToast({ show: false, message: "" }), 3000);

      setEditingPkg(null); 
      fetchPackages(); 
    } catch (err) { 
        console.error(err);
        alert("Failed to save. Check console."); 
    }
  };

  // --- HELPERS ---
  const updateMenuCategory = (index, value) => {
      const newMenu = JSON.parse(JSON.stringify(editingPkg.menu));
      newMenu[index].category = value;
      setEditingPkg({ ...editingPkg, menu: newMenu });
  };

  const updateMenuItem = (catIndex, itemIndex, value) => {
      const newMenu = JSON.parse(JSON.stringify(editingPkg.menu));
      newMenu[catIndex].items[itemIndex].name = value;
      setEditingPkg({ ...editingPkg, menu: newMenu });
  };

  const addDish = (catIndex) => {
      const newMenu = JSON.parse(JSON.stringify(editingPkg.menu));
      newMenu[catIndex].items.push({ name: "", ingredients: [] });
      setEditingPkg({ ...editingPkg, menu: newMenu });
  };

  const removeDish = (catIndex, itemIndex) => {
      const newMenu = JSON.parse(JSON.stringify(editingPkg.menu));
      newMenu[catIndex].items = newMenu[catIndex].items.filter((_, i) => i !== itemIndex);
      setEditingPkg({ ...editingPkg, menu: newMenu });
  };

  const addCategory = () => {
      const newMenu = [...(editingPkg.menu || [])];
      newMenu.push({ category: "NEW SECTION", items: [] });
      setEditingPkg({ ...editingPkg, menu: newMenu });
  };

  // Theme Logic
  useEffect(() => {
    if (darkMode) { document.documentElement.classList.add('dark'); localStorage.setItem('theme', 'dark'); }
    else { document.documentElement.classList.remove('dark'); localStorage.setItem('theme', 'light'); }
  }, [darkMode]);

  const theme = {
    bg: darkMode ? 'bg-[#0c0c0c]' : 'bg-[#FAFAFA]',
    cardBg: darkMode ? 'bg-[#141414]' : 'bg-white',
    text: darkMode ? 'text-stone-200' : 'text-stone-900',
    subText: darkMode ? 'text-stone-500' : 'text-stone-500',
    border: darkMode ? 'border-stone-800' : 'border-stone-200',
    input: darkMode ? 'bg-transparent border-stone-700 text-stone-200 focus:border-[#C9A25D]' : 'bg-transparent border-stone-300 text-stone-900 focus:border-[#C9A25D]'
  };

  return (
    <div className={`flex h-screen w-full overflow-hidden font-sans ${theme.bg} ${theme.text}`}>
      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }`}</style>

      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} theme={theme} />

      <main className="flex-1 flex flex-col relative overflow-hidden">
        <DashboardNavbar activeTab="Menu Management" theme={theme} darkMode={darkMode} setDarkMode={setDarkMode} />

        <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
          
          <div className="flex justify-between items-end mb-8">
             <div>
                <h2 className={`font-serif text-3xl italic ${theme.text}`}>Packages & Menus</h2>
                <p className={`text-xs mt-1 ${theme.subText}`}>Customize what clients see on their proposal.</p>
             </div>
          </div>

          {editingPkg ? (
             // --- EDIT MODAL ---
             <div className={`max-w-4xl mx-auto ${theme.cardBg} border ${theme.border} p-8 rounded-sm shadow-2xl animate-in fade-in zoom-in duration-300`}>
                
                {/* Modal Header */}
                <div className="flex justify-between items-center mb-8 border-b border-dashed border-stone-700 pb-4">
                    <div>
                        <h3 className="font-serif text-2xl text-[#C9A25D]">Edit Package</h3>
                        <p className="text-[10px] uppercase tracking-widest text-stone-500">Update details for {editingPkg.name}</p>
                    </div>
                    <div className="flex gap-3">
                        {/* FIX: CANCEL BUTTON VISIBILITY */}
                        <button 
                            onClick={() => setEditingPkg(null)} 
                            className="px-6 py-2 text-xs uppercase tracking-widest border rounded-sm transition-colors border-stone-300 text-stone-500 hover:bg-stone-100 hover:text-stone-900 dark:border-stone-600 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-white"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleSave} 
                            className="px-6 py-2 text-xs uppercase tracking-widest bg-[#C9A25D] text-white hover:bg-[#b08d55] rounded-sm flex items-center gap-2 transition-colors shadow-lg"
                        >
                            <Save size={14}/> Save Changes
                        </button>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* Top Row inputs */}
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <label className="text-[10px] uppercase tracking-widest text-stone-500 mb-2 block font-bold">Package Name</label>
                            <input type="text" value={editingPkg.name} onChange={e => setEditingPkg({...editingPkg, name: e.target.value})} className={`w-full p-3 text-sm rounded-sm border focus:outline-none ${theme.input}`}/>
                        </div>
                        <div>
                            <label className="text-[10px] uppercase tracking-widest text-stone-500 mb-2 block font-bold">Price Per Head</label>
                            <div className={`flex items-center border rounded-sm px-3 ${darkMode ? 'border-stone-700' : 'border-stone-300'}`}>
                                <span className="text-stone-500 text-sm">₱</span>
                                <input type="number" value={editingPkg.price || 0} onChange={e => setEditingPkg({...editingPkg, price: Number(e.target.value)})} className={`w-full p-3 text-sm bg-transparent focus:outline-none ${darkMode ? 'text-stone-200' : 'text-stone-900'}`}/>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="text-[10px] uppercase tracking-widest text-stone-500 mb-2 block font-bold">Description</label>
                        <textarea value={editingPkg.description || ""} onChange={e => setEditingPkg({...editingPkg, description: e.target.value})} rows={2} className={`w-full p-3 text-sm rounded-sm border focus:outline-none resize-none ${theme.input}`}/>
                    </div>

                    {/* Menu Items Section */}
                    <div>
                        <label className="text-[10px] uppercase tracking-widest text-[#C9A25D] mb-4 block font-bold border-b border-stone-800 pb-2">Menu Composition</label>
                        
                        <div className="space-y-6">
                            {editingPkg.menu && editingPkg.menu.map((cat, catIdx) => (
                                <div key={catIdx} className={`border ${theme.border} rounded-sm overflow-hidden`}>
                                    
                                    {/* Category Header */}
                                    <div className={`px-4 py-3 flex justify-between items-center border-b ${theme.border} bg-transparent`}>
                                        <input 
                                            type="text" 
                                            value={cat.category} 
                                            onChange={(e) => updateMenuCategory(catIdx, e.target.value)}
                                            className="bg-transparent font-bold text-xs uppercase tracking-widest text-[#C9A25D] focus:outline-none w-full placeholder-stone-600"
                                            placeholder="CATEGORY NAME"
                                        />
                                    </div>

                                    {/* Dishes List */}
                                    <div className="p-4 space-y-3">
                                        {cat.items.map((item, itemIdx) => (
                                            <div key={itemIdx} className="flex gap-4 items-center group">
                                                <Utensils size={14} className="text-stone-600 group-hover:text-[#C9A25D] transition-colors"/>
                                                <input 
                                                    type="text" 
                                                    value={item.name} 
                                                    onChange={(e) => updateMenuItem(catIdx, itemIdx, e.target.value)}
                                                    className={`flex-1 bg-transparent border-b ${theme.border} pb-1 text-sm focus:outline-none focus:border-[#C9A25D] ${theme.text} placeholder-stone-600`}
                                                    placeholder="Dish Name"
                                                />
                                                <button 
                                                    onClick={() => removeDish(catIdx, itemIdx)}
                                                    className="text-stone-600 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ))}
                                        
                                        <button 
                                            onClick={() => addDish(catIdx)}
                                            className="mt-4 text-[10px] uppercase tracking-widest text-stone-500 hover:text-[#C9A25D] flex items-center gap-2 py-2 px-2 border border-dashed border-stone-700 hover:border-[#C9A25D] rounded-sm w-full justify-center transition-all"
                                        >
                                            <Plus size={12} /> Add Dish to {cat.category}
                                        </button>
                                    </div>
                                </div>
                            ))}
                            
                            <button 
                                onClick={addCategory}
                                className="w-full py-4 border border-dashed border-stone-600 text-stone-400 text-xs uppercase tracking-widest hover:text-white hover:border-white transition-colors"
                            >
                                + Add New Menu Category
                            </button>
                        </div>
                    </div>
                </div>
             </div>
          ) : (
             // --- LIST MODE ---
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {packages.map((pkg) => (
                     <div key={pkg.id} className={`group relative p-8 border ${theme.border} ${theme.cardBg} rounded-sm hover:border-[#C9A25D] transition-all duration-300 flex flex-col h-full hover:shadow-xl hover:-translate-y-1`}>
                         <div className="mb-6">
                             <div className="flex justify-between items-start mb-2">
                                 <h3 className={`font-serif text-2xl ${theme.text}`}>{pkg.name}</h3>
                                 <LayoutGrid size={18} className="text-stone-500 group-hover:text-[#C9A25D] transition-colors" />
                             </div>
                             <p className={`text-xs ${theme.subText} line-clamp-2 h-8 leading-relaxed`}>{pkg.description || "No description provided."}</p>
                         </div>

                         {/* CATEGORIES PREVIEW */}
                         <div className="mb-6 space-y-4 flex-1 overflow-y-auto max-h-60 no-scrollbar pr-2">
                             {pkg.menu && pkg.menu.map((cat, i) => (
                                 <div key={i}>
                                     <p className="text-[9px] font-bold uppercase text-[#C9A25D] tracking-widest mb-2">{cat.category}</p>
                                     <ul className="space-y-1.5 border-l border-stone-800 pl-3 ml-1">
                                        {cat.items.slice(0, 3).map((item, idx) => (
                                            <li key={idx} className="text-xs text-stone-400 flex items-center gap-2">
                                                 {item.name}
                                            </li>
                                        ))}
                                        {cat.items.length > 3 && <li className="text-[9px] text-stone-600 italic">+ {cat.items.length - 3} more</li>}
                                     </ul>
                                 </div>
                             ))}
                         </div>

                         <div className={`mt-auto pt-6 border-t ${theme.border} flex justify-between items-center`}>
                             <span className="font-serif text-xl text-[#C9A25D]">₱ {(pkg.price || 0).toLocaleString()}</span>
                             <button 
                                onClick={() => setEditingPkg(pkg)}
                                className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-stone-400 hover:text-white transition-colors border border-stone-700 px-4 py-2 rounded-sm hover:border-[#C9A25D] hover:bg-[#C9A25D]"
                             >
                                 Edit Package <Edit3 size={12} />
                             </button>
                         </div>
                     </div>
                 ))}
                 
                 {packages.length === 0 && !isLoading && (
                     <div className="col-span-full text-center py-20 text-stone-500">
                         No packages found. Please re-seed via console.
                     </div>
                 )}
             </div>
          )}

        </div>
        
        {/* Render Toast */}
        <SuccessToast show={toast.show} message={toast.message} onClose={() => setToast({ ...toast, show: false })} />
      </main>
    </div>
  );
};

export default MenuManagement;
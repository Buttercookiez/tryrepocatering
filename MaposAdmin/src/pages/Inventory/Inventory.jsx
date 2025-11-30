import React, { useState, useEffect, useRef } from 'react';
import { 
  Package, ArrowUpDown, AlertTriangle, Layers,
  Minus, Plus, Check, Search, Calendar, User, Briefcase, X, 
  Download, Filter, Box, ArrowRight, ChevronDown, Edit3, Trash2
} from 'lucide-react';

import Sidebar from '../../components/layout/Sidebar';
import DashboardNavbar from '../../components/layout/Navbar';
import { InventorySkeleton } from '../../components/SkeletonLoaders';

const API_BASE = (process.env.REACT_APP_API_BASE || 'http://localhost:5000') + '/api/inventory';

// --- HELPER: CUSTOM DROPDOWN ---
const CustomDropdown = ({ options, value, onChange, placeholder, theme }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <div 
                onClick={() => setIsOpen(!isOpen)} 
                className={`w-full bg-transparent border-b ${theme.border} py-3 text-sm cursor-pointer flex justify-between items-center transition-colors group select-none`}
            >
                <span className={value ? theme.text : "text-stone-500"}>
                    {value || placeholder}
                </span>
                <ChevronDown 
                    size={14} 
                    className={`text-stone-400 group-hover:text-[#C9A25D] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
                />
            </div>

            {isOpen && (
                <div className={`absolute top-full left-0 w-full z-50 max-h-48 overflow-y-auto ${theme.cardBg} border ${theme.border} shadow-2xl mt-1 custom-scrollbar animate-in fade-in zoom-in-95 duration-200`}>
                    {options.map((option) => (
                        <div 
                            key={option} 
                            onClick={() => { onChange(option); setIsOpen(false); }} 
                            className={`px-4 py-3 text-sm cursor-pointer transition-colors ${theme.text} hover:bg-[#C9A25D] hover:text-white`}
                        >
                            {option}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// --- 1. SUCCESS TOAST ---
const SuccessToast = ({ message, show, onClose }) => {
    if (!show) return null;
    return (
        <div className="fixed bottom-10 right-10 z-[10000] animate-in slide-in-from-right-10 fade-in duration-500">
            <div className="bg-white dark:bg-[#181818] border border-stone-200 dark:border-stone-800 border-l-[6px] border-l-[#C9A25D] rounded-r-sm shadow-2xl p-6 flex items-start gap-5 min-w-[350px]">
                <div className="bg-[#C9A25D] rounded-full p-2 shrink-0 shadow-lg shadow-[#C9A25D]/20">
                    <Check size={20} className="text-white" strokeWidth={3} />
                </div>
                <div className="flex-1">
                    <h4 className="text-base font-serif font-bold text-stone-800 dark:text-white leading-none mb-1.5 tracking-wide">System Update</h4>
                    <p className="text-sm text-stone-500 dark:text-stone-400 leading-snug">{message}</p>
                </div>
                <button onClick={onClose} className="text-stone-300 hover:text-stone-500 dark:hover:text-white transition-colors -mt-1 -mr-1"><X size={18} /></button>
            </div>
        </div>
    );
};

// --- 2. DELETE CONFIRMATION MODAL ---
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, itemName, theme }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-300">
            <div className={`w-full max-w-sm ${theme.cardBg} border border-red-900/30 rounded-sm shadow-2xl relative overflow-hidden`}>
                <div className="p-6 text-center">
                    <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                        <Trash2 size={32} className="text-red-500" />
                    </div>
                    <h3 className={`font-serif text-2xl ${theme.text} mb-2`}>Delete Asset?</h3>
                    <p className={`text-sm ${theme.subText} mb-6 leading-relaxed`}>
                        Are you sure you want to remove <span className="text-red-500 font-bold">"{itemName}"</span>? 
                        <br/>This action cannot be undone.
                    </p>
                    <div className="flex gap-3 justify-center">
                        <button onClick={onClose} className={`px-6 py-2.5 text-xs uppercase tracking-widest border ${theme.border} ${theme.text} hover:bg-stone-800 transition-colors rounded-sm`}>Cancel</button>
                        <button onClick={onConfirm} className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs uppercase tracking-widest transition-colors rounded-sm shadow-lg">Yes, Delete</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- 3. ADD/EDIT ITEM MODAL ---
const ItemModal = ({ isOpen, onClose, onSave, theme, categories, itemToEdit }) => {
  const [formData, setFormData] = useState({ name: '', category: '', quantity: '', unit: 'Pcs', threshold: '' });
  
  useEffect(() => {
    if (isOpen && itemToEdit) {
        setFormData({
            name: itemToEdit.name,
            category: itemToEdit.category,
            quantity: itemToEdit.quantity,
            unit: itemToEdit.unit,
            threshold: itemToEdit.threshold || 10
        });
    } else if (isOpen && !itemToEdit) {
        setFormData({ name: '', category: '', quantity: '', unit: 'Pcs', threshold: '' });
    }
  }, [isOpen, itemToEdit]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!formData.name || !formData.category || formData.quantity === "") {
        alert("Please fill in Name, Category, and Stock.");
        return;
    }
    
    const itemData = {
      ...formData,
      quantity: Number(formData.quantity),
      threshold: Number(formData.threshold) || 10,
    };

    if (itemToEdit) {
        onSave({ ...itemToEdit, ...itemData });
    } else {
        onSave({
            ...itemData,
            sku: `SKU-${Math.floor(1000 + Math.random() * 9000)}`, 
        });
    }
    onClose();
  };

  const inputClass = `w-full bg-transparent border-b ${theme.border} py-3 text-sm ${theme.text} placeholder-stone-500 focus:outline-none focus:border-[#C9A25D] transition-colors`;
  const labelClass = "text-[10px] uppercase tracking-widest text-stone-400 font-bold block mb-1";

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-300">
      <div className={`w-full max-w-lg ${theme.cardBg} rounded-sm shadow-2xl border ${theme.border} p-8 relative`}>
        <button onClick={onClose} className="absolute top-4 right-4 text-stone-400 hover:text-red-500 transition-colors"><X size={20}/></button>
        <div className="mb-8">
          <h3 className={`font-serif text-3xl ${theme.text} mb-1`}>{itemToEdit ? 'Edit Asset' : 'Register Asset'}</h3>
          <p className={theme.subText}>{itemToEdit ? 'Update details below.' : 'Add new equipment to the inventory system.'}</p>
        </div>
        
        <div className="space-y-6">
          <div>
             <label className={labelClass}>Item Name</label>
             <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Gold Rim Dinner Plate" className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-6">
             <div>
                 <label className={labelClass}>Category</label>
                 <CustomDropdown 
                    options={categories.filter(c => c !== 'All')} 
                    value={formData.category} 
                    onChange={(val) => setFormData({...formData, category: val})} 
                    placeholder="Select Category"
                    theme={theme}
                 />
             </div>
             <div>
                 <label className={labelClass}>Current Stock</label>
                 <input 
                    type="number" 
                    value={formData.quantity} 
                    onChange={e => setFormData({...formData, quantity: e.target.value})} 
                    placeholder="Enter Qty" 
                    className={inputClass} 
                 />
             </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
             <div>
                 <label className={labelClass}>Unit Type</label>
                 <input type="text" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} placeholder="Pcs / Sets" className={inputClass} />
             </div>
             <div>
                 <label className={labelClass}>Low Alert Limit</label>
                 <input type="number" value={formData.threshold} onChange={e => setFormData({...formData, threshold: e.target.value})} placeholder="100" className={inputClass} />
             </div>
          </div>
        </div>
        
        <div className="mt-10 flex justify-end gap-3">
          <button onClick={onClose} className={`px-6 py-2 text-xs uppercase tracking-widest border ${theme.border} ${theme.text} hover:border-[#C9A25D] hover:text-[#C9A25D] bg-transparent transition-colors rounded-sm`}>Cancel</button>
          <button onClick={handleSubmit} className="px-6 py-2 bg-[#1c1c1c] text-white text-xs uppercase tracking-widest hover:bg-[#C9A25D] transition-colors rounded-sm shadow-lg border border-transparent">
            {itemToEdit ? 'Update Asset' : 'Save Asset'}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- 4. ALLOCATION MODAL ---
const AllocationModal = ({ isOpen, onClose, onConfirm, event, theme, requiredAssets }) => {
    if (!isOpen || !event) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-300">
            <div className={`w-full max-w-md ${theme.cardBg} border ${theme.border} p-0 rounded-sm shadow-2xl relative overflow-hidden`}>
                <div className={`p-6 border-b ${theme.border}`}>
                    <h3 className={`font-serif text-2xl ${theme.text} mb-1`}>Confirm Allocation</h3>
                    <p className={`text-xs ${theme.subText}`}>You are about to deduct assets from inventory.</p>
                </div>
                <div className="p-6 space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full border border-[#C9A25D]/30 text-[#C9A25D] flex items-center justify-center">
                            <User size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">Client</p>
                            <p className={`font-serif text-xl ${theme.text}`}>{event.client}</p>
                            <p className={`text-xs ${theme.subText}`}>{event.guests} Guests • {event.eventType}</p>
                        </div>
                    </div>
                    <div className={`border-t border-dashed ${theme.border} pt-4`}>
                        <p className="text-[10px] uppercase tracking-widest text-[#C9A25D] font-bold mb-3 flex items-center gap-2">
                            <Box size={12}/> Deducting the following:
                        </p>
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                            {requiredAssets.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center text-sm group">
                                    <span className={`${theme.text} group-hover:text-[#C9A25D] transition-colors`}>{item.name}</span>
                                    <span className="font-mono text-stone-500 font-bold group-hover:text-white transition-colors">-{item.qty}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className={`p-6 border-t ${theme.border} flex justify-end gap-3 bg-transparent`}>
                    <button onClick={onClose} className={`px-6 py-2 text-xs uppercase tracking-widest border ${theme.border} ${theme.text} hover:border-[#C9A25D] hover:text-[#C9A25D] bg-transparent transition-colors rounded-sm`}>Cancel</button>
                    <button onClick={onConfirm} className="px-6 py-2 bg-[#C9A25D] text-white text-xs uppercase tracking-widest hover:bg-[#b08d55] transition-colors rounded-sm shadow-lg flex items-center gap-2"><Check size={14} /> Confirm Deduction</button>
                </div>
            </div>
        </div>
    );
};

// --- 5. VISUAL STOCK BAR ---
const StockBar = ({ current, threshold, theme }) => {
    const isLow = Number(current) <= Number(threshold);
    const percentage = Math.min(100, (current / (threshold * 3)) * 100);
    
    return (
        <div className="w-full">
             <div className="flex justify-between items-end mb-2">
                <span className={`font-mono text-sm ${isLow ? 'text-red-400 font-bold' : theme.text}`}>{current}</span>
                {isLow && <span className="text-[9px] text-red-400 uppercase tracking-wider font-bold flex items-center gap-1"><AlertTriangle size={10}/> Low Stock</span>}
            </div>
            <div className="w-full h-1 bg-stone-200 dark:bg-white/10 rounded-full overflow-hidden">
                <div className={`h-full transition-all duration-700 ease-out rounded-full ${isLow ? 'bg-red-400' : 'bg-[#C9A25D]'}`} style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    );
};

// --- 6. MAIN COMPONENT ---
const Inventory = () => {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [sidebarOpen, setSidebarOpen] = useState(() => { const saved = localStorage.getItem('sidebarState'); return saved !== null ? JSON.parse(saved) : true; });

  const [activeTab, setActiveTab] = useState('Assets'); 
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null); 
  
  const [allocationModal, setAllocationModal] = useState({ isOpen: false, event: null });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, name: '' });

  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState({ show: false, message: "" });

  const [inventory, setInventory] = useState([]);
  const [events, setEvents] = useState([]);
  
  const categories = ["All", "Furniture", "Linens", "Dining", "Equipment"];

  const getTodayString = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1);
    const day = String(date.getDate()); 
    return `${month}/${day}/${year}`;
  };
  const todaysDateDisplay = getTodayString(); 

  useEffect(() => { localStorage.setItem('sidebarState', JSON.stringify(sidebarOpen)); }, [sidebarOpen]);

  const fetchData = async () => {
      setIsLoading(true);
      try {
          const [invRes, evtRes] = await Promise.all([
              fetch(`${API_BASE}`),
              fetch(`${API_BASE}/allocations?date=${todaysDateDisplay}`)
          ]);
          
          const invData = await invRes.json();
          const evtData = await evtRes.json();

          setInventory(Array.isArray(invData) ? invData : []);
          setEvents(Array.isArray(evtData) ? evtData : []);

      } catch (err) { console.error(err); } 
      finally { setIsLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSaveItem = async (itemData) => {
      const method = itemToEdit ? 'PUT' : 'POST';
      const url = itemToEdit ? `${API_BASE}/${itemToEdit.id}` : `${API_BASE}`;
      
      if (itemToEdit) {
          setInventory(prev => prev.map(item => item.id === itemToEdit.id ? { ...item, ...itemData } : item));
          setToast({ show: true, message: "Asset details updated successfully." });
      } else {
          const tempId = Date.now();
          setInventory(prev => [{ ...itemData, id: tempId }, ...prev]);
          setToast({ show: true, message: "New asset added to inventory." });
      }
      setTimeout(() => setToast({ show: false }), 4000);

      try {
          const res = await fetch(url, { 
            method: method, 
            headers: {'Content-Type': 'application/json'}, 
            body: JSON.stringify(itemData) 
          });
          if(!res.ok) console.warn("Backend sync issue");
          if(!itemToEdit) fetchData();
      } catch(err) { console.error("Sync Error", err); }
      
      setItemToEdit(null);
  };

  const handleDeleteClick = (id, name) => {
      setDeleteModal({ isOpen: true, id, name });
  };

  const confirmDelete = async () => {
      const { id } = deleteModal;
      setDeleteModal({ isOpen: false, id: null, name: '' }); 

      setInventory(prev => prev.filter(item => item.id !== id));
      setToast({ show: true, message: "Asset deleted from system." });
      setTimeout(() => setToast({ show: false }), 4000);

      try {
          await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
      } catch (err) {
          console.error("Delete failed", err);
          fetchData();
      }
  };

  const openEditModal = (item) => {
      setItemToEdit(item);
      setIsModalOpen(true);
  };

  const openNewModal = () => {
      setItemToEdit(null);
      setIsModalOpen(true);
  };

  const handleStockChange = async (id, currentQty, change) => {
      const newQty = Math.max(0, Number(currentQty) + change);
      setInventory(prev => prev.map(item => item.id === id ? { ...item, quantity: newQty } : item));
      try {
          await fetch(`${API_BASE}/${id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ quantity: newQty })
          });
      } catch (err) { console.error("Update failed"); fetchData(); }
  };

  const openAllocationModal = (event) => {
      setAllocationModal({ isOpen: true, event: event });
  };

  const confirmAllocation = async () => {
      const { event } = allocationModal;
      if (!event) return;
      setAllocationModal({ isOpen: false, event: null }); 
      try {
          const res = await fetch(`${API_BASE}/allocate`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ eventId: event.id, guests: event.guests, packageId: event.packageId })
          });

          if (res.ok) {
              setToast({ show: true, message: `Assets allocated for ${event.client}.` });
              setTimeout(() => setToast({ ...toast, show: false }), 3000);
              fetchData(); 
          }
      } catch (err) { alert("Allocation Failed"); }
  };

  const filteredInventory = inventory.filter(item => {
      const matchesSearch = item.name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === "All" || item.category === categoryFilter;
      return matchesSearch && matchesCategory;
  });

  const getPackageName = (id) => {
    if (id === 3) return "Grand Gala";
    if (id === 2) return "Premium Plated";
    return "Classic Buffet";
  };

  const getRequiredAssets = (pkgId, guests) => {
    const items = [
        { name: "Dinner Plates", qty: guests },
        { name: "Cutlery Sets", qty: guests }, 
        { name: "Goblets", qty: guests },
        { name: "Tiffany Chairs", qty: guests },
        { name: "Tables", qty: Math.ceil(guests/10) },
    ];
    if (pkgId === 3) items.push({ name: "Wine Glasses", qty: guests });
    return items;
  };

  useEffect(() => {
    if (darkMode) { document.documentElement.classList.add('dark'); localStorage.setItem('theme', 'dark'); }
    else { document.documentElement.classList.remove('dark'); localStorage.setItem('theme', 'light'); }
  }, [darkMode]);

  const theme = {
    bg: darkMode ? 'bg-[#0c0c0c]' : 'bg-[#FAFAFA]',
    cardBg: darkMode ? 'bg-[#141414]' : 'bg-white',
    text: darkMode ? 'text-stone-200' : 'text-stone-900',
    subText: darkMode ? 'text-stone-500' : 'text-stone-500',
    border: darkMode ? 'border-stone-800' : 'border-stone-300',
    hoverBg: 'hover:bg-[#C9A25D]/5'
  };

  return (
    <div className={`flex h-screen w-full overflow-hidden font-sans ${theme.bg} ${theme.text} selection:bg-[#C9A25D] selection:text-white`}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=Inter:wght@300;400;500&display=swap'); .font-serif { font-family: 'Cormorant Garamond', serif; } .font-sans { font-family: 'Inter', sans-serif; } .no-scrollbar::-webkit-scrollbar { display: none; } .custom-scrollbar::-webkit-scrollbar { width: 4px; } .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; } input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }`}</style>
      
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} theme={theme} />
      
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <DashboardNavbar activeTab="Asset Inventory" theme={theme} darkMode={darkMode} setDarkMode={setDarkMode} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

        {isLoading ? <InventorySkeleton theme={theme} darkMode={darkMode} /> : (
            <div className="flex-1 overflow-y-auto px-6 md:px-12 pb-12 pt-8 no-scrollbar">
                
                <div className="flex flex-col md:flex-row justify-between items-end mb-8">
                    <div className="mb-4 md:mb-0">
                         <h2 className={`font-serif text-3xl italic ${theme.text} mb-1`}>Asset Management</h2>
                         <p className={`text-xs ${theme.subText}`}>Track equipment availability and event allocation.</p>
                    </div>
                    <div className={`flex border ${theme.border} rounded-sm p-1 ${theme.cardBg}`}>
                        {['Assets', 'Allocations'].map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-2 text-[10px] uppercase tracking-widest transition-all rounded-sm ${activeTab === tab ? 'bg-[#1c1c1c] text-white shadow-md' : `${theme.subText} hover:text-[#C9A25D]`}`}>
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                {activeTab === 'Assets' && (
                    <div className={`border ${theme.border} ${theme.cardBg} rounded-sm min-h-[500px] shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                        <div className={`p-6 flex flex-col md:flex-row justify-between items-center gap-4 border-b ${theme.border}`}>
                            <div className="flex gap-2 overflow-x-auto no-scrollbar">
                                {categories.map(cat => (
                                    <button 
                                        key={cat} 
                                        onClick={() => setCategoryFilter(cat)} 
                                        className={`px-4 py-2 text-[10px] uppercase tracking-widest rounded-sm border transition-all ${
                                            categoryFilter === cat 
                                            ? 'border-[#C9A25D] text-[#C9A25D] bg-[#C9A25D]/5' 
                                            : `border-transparent bg-transparent text-stone-500 hover:text-[#C9A25D] hover:bg-[#C9A25D]/10`
                                        }`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                            <button onClick={openNewModal} className="flex items-center gap-2 bg-[#1c1c1c] text-white px-6 py-2 text-[10px] uppercase tracking-widest hover:bg-[#C9A25D] transition-colors rounded-sm shadow-lg">
                                <Plus size={14} /> New Asset
                            </button>
                        </div>

                        <div className={`grid grid-cols-12 gap-6 px-8 py-4 bg-[#C9A25D]/10 text-[10px] uppercase tracking-widest font-bold text-stone-500 border-b ${theme.border}`}>
                            <div className="col-span-3">Item Name</div>
                            <div className="col-span-2">Category</div>
                            <div className="col-span-3">Stock Level</div>
                            <div className="col-span-2 text-right">Adjustment</div>
                            <div className="col-span-2 text-right">Actions</div>
                        </div>

                        <div className={`divide-y ${darkMode ? 'divide-stone-800' : 'divide-stone-100'}`}>
                            {filteredInventory.map((item) => (
                                <div key={item.id} className={`grid grid-cols-12 gap-6 px-8 py-5 items-center group ${theme.hoverBg} transition-colors`}>
                                    <div className="col-span-3">
                                        <span className={`font-serif text-lg block ${theme.text} leading-tight`}>{item.name}</span>
                                        <span className="text-[10px] text-stone-400 mt-0.5 block">{item.sku || 'SKU-0000'}</span>
                                    </div>
                                    <div className="col-span-2"><span className={`text-[9px] uppercase tracking-wider px-2 py-1 rounded border ${theme.border} text-stone-400`}>{item.category}</span></div>
                                    
                                    <div className="col-span-3 pr-4">
                                        <StockBar current={item.quantity} threshold={item.threshold} theme={theme} />
                                    </div>

                                    <div className="col-span-2 flex justify-end gap-2">
                                        <button 
                                            onClick={() => handleStockChange(item.id, item.quantity, -1)} 
                                            className={`w-8 h-8 flex items-center justify-center border ${theme.border} rounded-sm transition-all duration-300 text-stone-400 hover:border-[#C9A25D] hover:text-[#C9A25D]`}
                                        >
                                            <Minus size={14}/>
                                        </button>
                                        <button 
                                            onClick={() => handleStockChange(item.id, item.quantity, 1)} 
                                            className={`w-8 h-8 flex items-center justify-center border ${theme.border} rounded-sm transition-all duration-300 text-stone-400 hover:border-[#C9A25D] hover:text-[#C9A25D]`}
                                        >
                                            <Plus size={14}/>
                                        </button>
                                    </div>

                                    {/* ALWAYS VISIBLE ACTIONS (CLEANED UP - NO GRAY) */}
                                    <div className="col-span-2 flex justify-end gap-3">
                                        <button 
                                            onClick={() => openEditModal(item)} 
                                            className="w-8 h-8 flex items-center justify-center rounded-sm text-stone-400 hover:text-[#C9A25D] hover:bg-[#C9A25D]/10 transition-all"
                                            title="Edit Details"
                                        >
                                            <Edit3 size={14} />
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteClick(item.id, item.name)} 
                                            className="w-8 h-8 flex items-center justify-center rounded-sm text-stone-400 hover:text-red-500 hover:bg-red-500/10 transition-all"
                                            title="Delete Asset"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {filteredInventory.length === 0 && (
                             <div className="py-20 text-center text-stone-500 italic font-serif">No assets found matching your criteria.</div>
                        )}
                    </div>
                )}

                {activeTab === 'Allocations' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className={`p-6 border border-l-4 border-l-[#C9A25D] ${theme.border} rounded-sm ${theme.cardBg} flex gap-4 items-start shadow-sm`}>
                            <div className="bg-[#C9A25D]/10 p-2 rounded-full"><Layers className="text-[#C9A25D]" size={20} /></div>
                            <div>
                                <h4 className={`text-sm font-bold ${theme.text} uppercase tracking-widest mb-1`}>Allocation Manager</h4>
                                <p className={`text-xs ${theme.subText} leading-relaxed`}>
                                    Viewing confirmed events for <span className="text-[#C9A25D] font-bold">{todaysDateDisplay}</span>. 
                                    Allocate assets to deduct them from the main inventory based on the guest count.
                                </p>
                            </div>
                        </div>

                        <div className={`grid grid-cols-1 gap-6`}>
                            {events.length === 0 ? (
                                <div className={`text-center py-20 ${theme.subText} border border-dashed ${theme.border} rounded-sm`}>
                                    No confirmed events scheduled for today.
                                </div>
                            ) : events.map(evt => (
                                <div key={evt.id} className={`p-8 border ${theme.border} ${theme.cardBg} rounded-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 group hover:border-[#C9A25D] transition-all shadow-md`}>
                                    
                                    <div className="flex gap-6 items-start min-w-[300px]">
                                        <div className={`w-14 h-14 flex items-center justify-center border ${theme.border} rounded-full ${evt.isAllocated ? 'bg-emerald-500/10 text-emerald-500' : 'bg-[#C9A25D]/10 text-[#C9A25D]'}`}>
                                            {evt.isAllocated ? <Check size={24}/> : <Calendar size={24}/>}
                                        </div>
                                        <div>
                                            <span className="text-[10px] uppercase text-[#C9A25D] font-bold tracking-widest block mb-1">{getPackageName(evt.packageId)}</span>
                                            <h4 className={`font-serif text-3xl ${theme.text} leading-none mb-3`}>{evt.client}</h4>
                                            <div className={`flex gap-4 text-xs ${theme.subText}`}>
                                                <span className="flex items-center gap-1"><User size={12}/> {evt.guests} Pax</span>
                                                <span className="flex items-center gap-1"><Briefcase size={12}/> {evt.eventType}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className={`flex-1 w-full lg:w-auto border-t lg:border-t-0 lg:border-l border-dashed ${theme.border} pt-6 lg:pt-0 lg:pl-8`}>
                                        <p className="text-[10px] uppercase text-stone-400 font-bold mb-4 flex items-center gap-2"><Box size={12}/> Required Assets</p>
                                        <div className="flex flex-wrap gap-2">
                                            {getRequiredAssets(evt.packageId, evt.guests).map((a, i) => (
                                                <span key={i} className={`text-[10px] px-3 py-1.5 rounded-sm border ${evt.isAllocated ? 'border-emerald-500/30 text-emerald-600 line-through opacity-60' : `${theme.border} ${theme.subText}`}`}>
                                                    {a.name}: <span className={evt.isAllocated ? '' : 'text-[#C9A25D] font-bold'}>{a.qty}</span>
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="text-right self-end lg:self-center">
                                        {evt.isAllocated ? (
                                            <span className="text-[10px] uppercase tracking-widest font-bold text-emerald-500 border border-emerald-500/30 px-6 py-3 rounded-sm bg-emerald-500/5 flex items-center gap-2">
                                                <Check size={14}/> Assets Deducted
                                            </span>
                                        ) : (
                                            <button onClick={() => openAllocationModal(evt)} className="px-6 py-3 bg-[#1c1c1c] hover:bg-[#C9A25D] text-white text-[10px] uppercase tracking-widest font-bold rounded-sm shadow-lg transition-all flex items-center gap-2">
                                                <Layers size={14} /> Allocate Now
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        )}
        
        <SuccessToast show={toast.show} message={toast.message} onClose={() => setToast({ ...toast, show: false })} />
        <ItemModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            onSave={handleSaveItem} 
            theme={theme} 
            categories={categories}
            itemToEdit={itemToEdit}
        />
        
        <DeleteConfirmationModal 
            isOpen={deleteModal.isOpen}
            onClose={() => setDeleteModal({ isOpen: false, id: null, name: '' })}
            onConfirm={confirmDelete}
            itemName={deleteModal.name}
            theme={theme}
        />

        <AllocationModal 
            isOpen={allocationModal.isOpen} 
            onClose={() => setAllocationModal({ isOpen: false, event: null })}
            onConfirm={confirmAllocation}
            event={allocationModal.event}
            theme={theme}
            requiredAssets={allocationModal.event ? getRequiredAssets(allocationModal.event.packageId, allocationModal.event.guests) : []}
        />

      </main>
    </div>
  );
};

export default Inventory;
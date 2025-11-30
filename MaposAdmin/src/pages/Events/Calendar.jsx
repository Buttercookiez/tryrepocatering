import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, ChevronRight, Plus, Clock, MapPin, 
  Users, Filter, MoreHorizontal, X, Trash2, Save, ChevronDown, Lock, AlertTriangle 
} from 'lucide-react';

// Import Layout Components
import Sidebar from '../../components/layout/Sidebar';
import DashboardNavbar from '../../components/layout/Navbar';
import { CalendarSkeleton } from '../../components/SkeletonLoaders';
import api from '../../api/api'; 

// --- 1. ANIMATION COMPONENT ---
const FadeIn = ({ children, delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) setIsVisible(true); }, { threshold: 0.1 });
    if (ref.current) observer.observe(ref.current);
  }, []);
  return <div ref={ref} className={`transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
};

// --- 2. BLOCK DATE MODAL ---
const BlockDateModal = ({ isOpen, onClose, onSave, theme, selectedDate }) => {
    const [dateStr, setDateStr] = useState("");
    const [reason, setReason] = useState("Fully Booked");

    useEffect(() => {
        if (isOpen && selectedDate) {
            const formatted = selectedDate.toLocaleDateString('en-US');
            setDateStr(formatted);
            setReason("Fully Booked");
        }
    }, [isOpen, selectedDate]);

    const handleSubmit = () => {
        if (!dateStr) return alert("Date is required");
        onSave({ date: dateStr, reason });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className={`w-full max-w-sm ${theme.cardBg} rounded-sm shadow-2xl border ${theme.border} p-6 transform transition-all scale-100`}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className={`font-serif text-xl ${theme.text}`}>Block Date</h3>
                    <button onClick={onClose}><X size={18} className="text-stone-400 hover:text-red-500 transition-colors"/></button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className={`text-[10px] uppercase tracking-widest ${theme.subText}`}>Date (MM/DD/YYYY)</label>
                        <input type="text" value={dateStr} onChange={(e) => setDateStr(e.target.value)} placeholder="MM/DD/YYYY" className={`w-full bg-transparent border-b ${theme.border} py-2 text-sm ${theme.text} focus:outline-none focus:border-[#C9A25D]`} />
                    </div>
                    <div>
                        <label className={`text-[10px] uppercase tracking-widest ${theme.subText}`}>Reason</label>
                        <input type="text" value={reason} onChange={(e) => setReason(e.target.value)} className={`w-full bg-transparent border-b ${theme.border} py-2 text-sm ${theme.text} focus:outline-none focus:border-[#C9A25D]`} />
                    </div>
                </div>
                <div className="mt-6 flex justify-end">
                    <button onClick={handleSubmit} className="px-6 py-2 bg-red-600 text-white text-xs uppercase tracking-widest hover:bg-red-700 transition-colors rounded-sm flex items-center gap-2">
                        <Lock size={14}/> Confirm Block
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- 3. UNBLOCK CONFIRMATION MODAL (NEW) ---
const UnblockConfirmationModal = ({ isOpen, onClose, onConfirm, theme }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className={`w-full max-w-sm ${theme.cardBg} rounded-sm shadow-2xl border ${theme.border} p-6 text-center transform transition-all scale-100`}>
                <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4 text-red-500">
                    <AlertTriangle size={24} />
                </div>
                <h3 className={`font-serif text-xl ${theme.text} mb-2`}>Unblock this Date?</h3>
                <p className={`text-xs ${theme.subText} mb-6 leading-relaxed`}>
                    This will remove the "Fully Booked" status and allow new inquiries for this date. Are you sure?
                </p>
                <div className="flex justify-center gap-3">
                    <button onClick={onClose} className={`px-6 py-2 border ${theme.border} ${theme.text} text-xs uppercase tracking-widest hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors rounded-sm`}>
                        Cancel
                    </button>
                    <button onClick={onConfirm} className="px-6 py-2 bg-red-600 text-white text-xs uppercase tracking-widest hover:bg-red-700 transition-colors rounded-sm shadow-lg">
                        Yes, Unblock
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- 4. EVENT MODAL ---
const EventModal = ({ isOpen, onClose, onSave, eventToEdit, theme, darkMode }) => {
  const [formData, setFormData] = useState({ fullName: '', eventType: 'Wedding', startTime: '', estimatedGuests: '', venueId: 'Grand Ballroom', dateOfEvent: '' });
  const [typeOpen, setTypeOpen] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);
  const generateTimeSlots = () => { const times = []; for (let i = 0; i < 24; i++) { const hour = i === 0 || i === 12 ? 12 : i % 12; const period = i < 12 ? 'AM' : 'PM'; times.push(`${hour}:00 ${period}`); times.push(`${hour}:30 ${period}`); } return times; };
  const timeSlots = generateTimeSlots();
  const eventTypes = ['Private Dinner', 'Wedding', 'Corporate', 'Social', 'Tasting']; 
  useEffect(() => {
    if (eventToEdit) {
      setFormData({
        fullName: eventToEdit.title,
        eventType: eventToEdit.type,
        startTime: eventToEdit.time,
        estimatedGuests: eventToEdit.guests,
        venueId: eventToEdit.venue || 'Grand Ballroom',
        dateOfEvent: eventToEdit.date instanceof Date ? eventToEdit.date.toLocaleDateString() : ''
      });
    } else {
      setFormData({ fullName: '', eventType: 'Wedding', startTime: '', estimatedGuests: '', venueId: 'Grand Ballroom', dateOfEvent: '' });
    }
  }, [eventToEdit, isOpen]);
  const inputBase = `w-full bg-transparent border-b ${theme.border} py-3 pl-0 text-sm ${theme.text} placeholder-stone-400 focus:outline-none focus:border-[#C9A25D] transition-colors`;
  const dropdownContainer = `absolute top-full left-0 w-full mt-1 p-2 shadow-xl rounded-sm z-50 transition-all duration-300 origin-top border ${theme.border} ${theme.cardBg} max-h-48 overflow-y-auto no-scrollbar`;
  const handleSubmit = () => { onSave({ ...formData, id: eventToEdit ? eventToEdit.id : undefined }); onClose(); };
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className={`w-full max-w-md ${theme.cardBg} rounded-sm shadow-2xl border ${theme.border} flex flex-col`}>
        <div className={`p-6 border-b ${theme.border} flex justify-between items-center`}><h3 className={`font-serif text-xl ${theme.text}`}>{eventToEdit ? 'Edit Booking' : 'New Booking'}</h3><button onClick={onClose} className="text-stone-400 hover:text-stone-600"><X size={18}/></button></div>
        <div className="p-6 space-y-6"><div><label className={`text-[10px] uppercase tracking-widest ${theme.subText}`}>Client Name</label><input type="text" placeholder="e.g. Juan Dela Cruz" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className={inputBase} /></div><div><label className={`text-[10px] uppercase tracking-widest ${theme.subText}`}>Date (MM/DD/YYYY)</label><input type="text" placeholder="11/30/2025" value={formData.dateOfEvent} onChange={e => setFormData({...formData, dateOfEvent: e.target.value})} className={inputBase} /></div><div className="grid grid-cols-2 gap-6"><div className="relative"><label className={`text-[10px] uppercase tracking-widest ${theme.subText}`}>Event Type</label><button type="button" onClick={() => setTypeOpen(!typeOpen)} className={`${inputBase} text-left flex items-center justify-between`}><span className={formData.eventType ? theme.text : "text-stone-400"}>{formData.eventType || "Type"}</span><ChevronDown className={`w-4 h-4 text-stone-400 transition-transform duration-300 ${typeOpen ? 'rotate-180' : ''}`} /></button><div className={`${dropdownContainer} ${typeOpen ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0 pointer-events-none'}`}><div className="flex flex-col gap-1">{eventTypes.map(t => (<div key={t} onClick={() => { setFormData({...formData, eventType: t}); setTypeOpen(false); }} className={`text-xs p-2 hover:bg-[#C9A25D] hover:text-white cursor-pointer transition-colors rounded-sm ${theme.text}`}>{t}</div>))}</div></div></div><div className="relative"><label className={`text-[10px] uppercase tracking-widest ${theme.subText}`}>Start Time</label><button type="button" onClick={() => setTimeOpen(!timeOpen)} className={`${inputBase} text-left flex items-center justify-between`}><div className="flex items-center gap-2"><Clock size={14} className="text-stone-400"/><span className={formData.startTime ? theme.text : "text-stone-400"}>{formData.startTime || "Time"}</span></div><ChevronDown className={`w-4 h-4 text-stone-400 transition-transform duration-300 ${timeOpen ? 'rotate-180' : ''}`} /></button><div className={`${dropdownContainer} ${timeOpen ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0 pointer-events-none'}`}><div className="grid grid-cols-1 gap-1">{timeSlots.map(t => (<div key={t} onClick={() => { setFormData({...formData, startTime: t}); setTimeOpen(false); }} className={`text-xs p-2 hover:bg-[#C9A25D] hover:text-white cursor-pointer transition-colors rounded-sm ${theme.text} text-center`}>{t}</div>))}</div></div></div></div><div className="grid grid-cols-2 gap-6"><div className="relative"><div className={`flex items-center border-b ${theme.border} pt-6`}><Users size={14} className="text-stone-400 mr-2" /><input type="number" placeholder="Guests" value={formData.estimatedGuests} onChange={e => setFormData({...formData, estimatedGuests: e.target.value})} className={`w-full bg-transparent py-3 text-sm ${theme.text} placeholder-stone-400 focus:outline-none no-spinner`} /></div></div><div className="relative"><div className={`flex items-center border-b ${theme.border} pt-6`}><MapPin size={14} className="text-stone-400 mr-2" /><input type="text" placeholder="Location" value={formData.venueId} onChange={e => setFormData({...formData, venueId: e.target.value})} className={`w-full bg-transparent py-3 text-sm ${theme.text} placeholder-stone-400 focus:outline-none`} /></div></div></div></div>
        <div className={`p-6 border-t ${theme.border} flex justify-end gap-3`}><button onClick={handleSubmit} className="px-6 py-2 bg-[#1c1c1c] text-white text-xs uppercase tracking-widest hover:bg-[#C9A25D] transition-colors rounded-sm flex items-center gap-2"><Save size={14}/> Save Booking</button></div>
      </div>
    </div>
  );
};

// --- 5. MAIN CALENDAR PAGE ---
const CalendarPage = () => {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [sidebarOpen, setSidebarOpen] = useState(() => { const saved = localStorage.getItem('sidebarState'); return saved !== null ? JSON.parse(saved) : true; });
  const [activeTab, setActiveTab] = useState('Calendar');
  const [searchQuery, setSearchQuery] = useState("");
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState([]);
  
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  
  // NEW: State for Unblock Confirmation
  const [unblockTargetId, setUnblockTargetId] = useState(null); 

  // --- API FETCH ---
  const fetchEvents = async () => {
    setIsLoading(true);
    try {
        const response = await api.get('/calendar/events'); 
        const formattedEvents = response.data.map(event => {
            let dateObj;
            if (typeof event.date === 'string') {
                const cleanDate = event.date.trim(); 
                if (cleanDate.includes('/')) {
                    const parts = cleanDate.split('/'); 
                    dateObj = new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]));
                } else {
                    dateObj = new Date(cleanDate);
                }
            } else {
                dateObj = new Date(event.date);
            }
            return { ...event, date: dateObj };
        });
        setEvents(formattedEvents);
    } catch (error) {
        console.error("Failed to load calendar events", error);
    } finally {
        setTimeout(() => setIsLoading(false), 800);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // --- HANDLERS ---
  
  const handleBlockDate = async (data) => {
      try {
          setIsLoading(true);
          await api.post('/calendar/block', data);
          await fetchEvents();
          setIsBlockModalOpen(false);
      } catch (error) {
          alert("Failed to block date");
          setIsLoading(false);
      }
  };

  // 1. Triggered when clicking Trash Icon
  const confirmUnblock = (id) => {
      setUnblockTargetId(id); // Opens the confirmation modal
  };

  // 2. Triggered when clicking "Yes, Unblock" in the modal
  const executeUnblock = async () => {
      if (!unblockTargetId) return;
      
      try {
          setIsLoading(true);
          await api.delete(`/calendar/unblock/${unblockTargetId}`);
          await fetchEvents();
          setUnblockTargetId(null); // Close modal
      } catch (error) {
          console.error(error);
          alert("Failed to unblock date");
          setIsLoading(false);
      }
  };

  const handleSaveEvent = async (eventData) => {
    try {
        setIsLoading(true);
        await api.post('/calendar/events', eventData);
        await fetchEvents();
        setIsModalOpen(false);
    } catch (error) {
        setIsLoading(false);
    }
  };

  useEffect(() => { localStorage.setItem('sidebarState', JSON.stringify(sidebarOpen)); }, [sidebarOpen]);
  useEffect(() => { if (darkMode) { document.documentElement.classList.add('dark'); localStorage.setItem('theme', 'dark'); } else { document.documentElement.classList.remove('dark'); localStorage.setItem('theme', 'light'); } }, [darkMode]);

  const theme = { bg: darkMode ? 'bg-[#0c0c0c]' : 'bg-[#FAFAFA]', cardBg: darkMode ? 'bg-[#141414]' : 'bg-white', text: darkMode ? 'text-stone-200' : 'text-stone-900', subText: darkMode ? 'text-stone-500' : 'text-stone-500', border: darkMode ? 'border-stone-800' : 'border-stone-200', accent: 'text-[#C9A25D]', accentBg: 'bg-[#C9A25D]', hoverBg: darkMode ? 'hover:bg-stone-800' : 'hover:bg-stone-100', pastText: darkMode ? 'text-stone-700' : 'text-stone-300' };

  const getEventsForDay = (date) => {
    return events.filter(e => {
      if(!e.date || isNaN(e.date)) return false; 
      return e.date.getDate() === date.getDate() && 
             e.date.getMonth() === date.getMonth() && 
             e.date.getFullYear() === date.getFullYear();
    });
  };

  const renderCalendarGrid = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date(); today.setHours(0,0,0,0); 
    const days = [];
    for (let i = 0; i < firstDay; i++) { days.push(<div key={`empty-${i}`} className={`h-24 md:h-32 border-b border-r ${theme.border} ${darkMode ? 'bg-black/20' : 'bg-stone-50/50'}`} />); }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(year, month, day);
      const dayEvents = getEventsForDay(dateObj);
      const isToday = today.toDateString() === dateObj.toDateString();
      const isSelected = selectedDate.toDateString() === dateObj.toDateString();
      const isBlocked = dayEvents.some(e => e.isBlocked);

      days.push(
        <div key={day} onClick={() => setSelectedDate(dateObj)} className={`relative h-24 md:h-32 border-b border-r ${theme.border} p-2 cursor-pointer transition-colors duration-300 ${isSelected ? (darkMode ? 'bg-stone-800' : 'bg-white ring-2 ring-inset ring-[#C9A25D]') : ''} ${isBlocked ? (darkMode ? 'bg-red-900/10' : 'bg-red-50') : (!isSelected ? theme.hoverBg : '')}`}>
          <div className="flex justify-between items-start">
            <span className={`text-sm font-serif w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-[#C9A25D] text-white shadow-md' : theme.text}`}>{day}</span>
            {isBlocked && <Lock size={12} className="text-red-400"/>}
          </div>
          <div className={`mt-2 space-y-1`}>
            {dayEvents.slice(0, 3).map((ev, idx) => (
              <div key={idx} className="flex items-center gap-1">
                <div className={`w-1.5 h-1.5 rounded-full ${ev.isBlocked ? 'bg-red-500' : ev.status === 'Confirmed' ? 'bg-[#C9A25D]' : 'bg-blue-400'}`}></div>
                <span className={`text-[9px] truncate w-full ${theme.subText} hidden md:block ${ev.isBlocked ? 'text-red-400 font-bold' : ''}`}>{ev.title}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return days;
  };

  const changeMonth = (offset) => { setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1)); };

  return (
    <div className={`flex h-screen w-full overflow-hidden font-sans ${theme.bg} ${theme.text} selection:bg-[#C9A25D] selection:text-white`}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=Inter:wght@300;400;500&display=swap'); .font-serif { font-family: 'Cormorant Garamond', serif; } .font-sans { font-family: 'Inter', sans-serif; } .no-scrollbar::-webkit-scrollbar { display: none; } .no-spinner::-webkit-outer-spin-button, .no-spinner::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }`}</style>
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} activeTab={activeTab} setActiveTab={setActiveTab} theme={theme} />
      <main className="flex-1 flex flex-col relative overflow-hidden">
        <DashboardNavbar activeTab="Events Calendar" theme={theme} darkMode={darkMode} setDarkMode={setDarkMode} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
        {isLoading ? ( <CalendarSkeleton theme={theme} darkMode={darkMode} /> ) : (
          <div className="flex-1 overflow-y-auto p-6 md:p-8 no-scrollbar">
            <FadeIn>
              <div className="flex flex-col lg:flex-row gap-8 h-full">
                <div className="flex-1 flex flex-col h-full">
                  <div className="flex justify-between items-end mb-6">
                    <div><span className={`text-[10px] uppercase tracking-[0.2em] ${theme.subText}`}>Schedule</span><h2 className="font-serif text-3xl md:text-4xl italic mt-1">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2></div>
                    <div className="flex items-center gap-2">
                      <div className={`flex border ${theme.border} rounded-sm overflow-hidden`}><button onClick={() => changeMonth(-1)} className={`p-2 hover:bg-[#C9A25D] hover:text-white transition-colors ${theme.subText}`}><ChevronLeft size={18} strokeWidth={1} /></button><div className={`w-[1px] ${theme.border}`}></div><button onClick={() => changeMonth(1)} className={`p-2 hover:bg-[#C9A25D] hover:text-white transition-colors ${theme.subText}`}><ChevronRight size={18} strokeWidth={1} /></button></div>
                      <button onClick={() => setIsBlockModalOpen(true)} className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 text-[10px] uppercase tracking-widest hover:bg-red-700 transition-colors"><Lock size={14} /> Block Date</button>
                      <button onClick={() => { setEditingEvent(null); setIsModalOpen(true); }} className="flex items-center gap-2 bg-[#1c1c1c] text-white px-4 py-2 text-[10px] uppercase tracking-widest hover:bg-[#C9A25D] transition-colors"><Plus size={14} /> New Event</button>
                    </div>
                  </div>
                  <div className={`border-t border-l ${theme.border} ${theme.cardBg}`}><div className="grid grid-cols-7">{['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (<div key={day} className={`py-3 text-center text-[10px] tracking-[0.2em] border-b border-r ${theme.border} ${darkMode ? 'bg-[#141414] text-stone-500' : 'bg-stone-50 text-stone-500'}`}>{day}</div>))}</div><div className="grid grid-cols-7">{renderCalendarGrid()}</div></div>
                </div>
                <div className="w-full lg:w-80 flex-shrink-0"><div className={`h-full border ${theme.border} ${theme.cardBg} p-6 flex flex-col`}><div className="mb-8"><span className={`text-[10px] uppercase tracking-[0.2em] ${theme.subText}`}>Selected Date</span><h3 className="font-serif text-3xl mt-2">{selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</h3></div><div className="flex-1 overflow-y-auto space-y-4 no-scrollbar">{getEventsForDay(selectedDate).length > 0 ? (getEventsForDay(selectedDate).map((event) => (<div key={event.id} className={`p-4 border ${theme.border} hover:border-[#C9A25D]/50 transition-all group relative ${event.isBlocked ? 'bg-red-500/5 border-red-500/20' : ''}`}><div className="flex justify-between items-start mb-2"><span className={`text-[10px] uppercase px-2 py-0.5 rounded-full border ${event.isBlocked ? 'text-red-500 border-red-500' : event.status === 'Confirmed' ? 'text-[#C9A25D] border-[#C9A25D]/30' : 'text-blue-400 border-blue-400/30'}`}>{event.isBlocked ? 'BLOCKED' : event.status}</span>
                        {/* UPDATE: Uses confirmUnblock to open the UI Modal */}
                        {event.isBlocked ? (<button onClick={() => confirmUnblock(event.id)} className="text-red-400 hover:text-red-600 p-1" title="Unblock Date"><Trash2 size={14} /></button>) : (<button onClick={(e) => { e.stopPropagation(); setEditingEvent(event); setIsModalOpen(true); }} className="text-stone-400 hover:text-[#C9A25D] p-1"><MoreHorizontal size={14} /></button>)}
                    </div><h4 className={`font-serif text-lg leading-tight mb-3 ${event.isBlocked ? 'text-red-400' : 'group-hover:text-[#C9A25D]'} transition-colors`}>{event.title}</h4>{!event.isBlocked && (<div className="space-y-2"><div className={`flex items-center gap-2 text-xs ${theme.subText}`}><Clock size={12} /> {event.time}</div><div className={`flex items-center gap-2 text-xs ${theme.subText}`}><Users size={12} /> {event.guests} Guests</div><div className={`flex items-center gap-2 text-xs ${theme.subText}`}><MapPin size={12} /> {event.venue || 'TBD'}</div></div>)}</div>))) : (<div className="h-40 flex flex-col items-center justify-center text-stone-400 border border-dashed border-stone-200 dark:border-stone-800"><span className="font-serif italic text-lg">No events</span><span className="text-[10px] uppercase tracking-wider mt-1">Free Schedule</span></div>)}</div></div></div></div></FadeIn>
          </div>
        )}
      </main>
      <EventModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveEvent} eventToEdit={editingEvent} theme={theme} darkMode={darkMode} />
      <BlockDateModal isOpen={isBlockModalOpen} onClose={() => setIsBlockModalOpen(false)} onSave={handleBlockDate} theme={theme} selectedDate={selectedDate} />
      
      {/* --- ADDED: The new UI Modal --- */}
      <UnblockConfirmationModal isOpen={!!unblockTargetId} onClose={() => setUnblockTargetId(null)} onConfirm={executeUnblock} theme={theme} />
    </div>
  );
};

export default CalendarPage;
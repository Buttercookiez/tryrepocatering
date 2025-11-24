import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, ChevronRight, Plus, Clock, MapPin, 
  Users, Filter, MoreHorizontal 
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

const CalendarPage = () => {
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
  const [activeTab, setActiveTab] = useState('Calendar');
  const [searchQuery, setSearchQuery] = useState("");
  
  // Calendar State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

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

  // --- Mock Events Data ---
  const events = [
    { id: 1, date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 5), title: 'Menu Tasting: Garcia', type: 'Tasting', time: '10:00 AM', guests: 4 },
    { id: 2, date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 12), title: 'TechSolutions Gala', type: 'Corporate', time: '06:00 PM', guests: 300 },
    { id: 3, date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 12), title: 'Prep: TechSolutions', type: 'Kitchen', time: '01:00 PM', guests: 0 },
    { id: 4, date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 24), title: 'Alcantara Wedding', type: 'Wedding', time: '04:00 PM', guests: 150 },
    { id: 5, date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 28), title: 'Isabella Debut', type: 'Social', time: '07:00 PM', guests: 80 },
  ];

  // Helper: Get events for specific day
  const getEventsForDay = (date) => {
    return events.filter(e => 
      e.date.getDate() === date.getDate() && 
      e.date.getMonth() === date.getMonth() &&
      e.date.getFullYear() === date.getFullYear()
    );
  };

  // Helper: Generate Calendar Grid
  const renderCalendarGrid = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    
    // Empty slots for previous month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className={`h-24 md:h-32 border-b border-r ${theme.border} bg-stone-50/50 dark:bg-stone-900/20`} />);
    }

    // Actual days
    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(year, month, day);
      const dayEvents = getEventsForDay(dateObj);
      const isToday = new Date().toDateString() === dateObj.toDateString();
      const isSelected = selectedDate.toDateString() === dateObj.toDateString();

      days.push(
        <div 
          key={day} 
          onClick={() => setSelectedDate(dateObj)}
          className={`
            relative h-24 md:h-32 border-b border-r ${theme.border} p-2 cursor-pointer transition-colors duration-300
            ${isSelected ? (darkMode ? 'bg-stone-800' : 'bg-stone-100') : theme.hoverBg}
          `}
        >
          <div className="flex justify-between items-start">
            <span className={`
              text-sm font-serif w-6 h-6 flex items-center justify-center rounded-full
              ${isToday ? 'bg-[#C9A25D] text-white' : theme.text}
            `}>
              {day}
            </span>
            {dayEvents.length > 0 && (
              <span className="text-[10px] font-bold text-stone-400">{dayEvents.length}</span>
            )}
          </div>

          {/* Event Indicators (Dots/Bars) */}
          <div className="mt-2 space-y-1">
            {dayEvents.slice(0, 3).map((ev, idx) => (
              <div key={idx} className="flex items-center gap-1">
                <div className={`w-1.5 h-1.5 rounded-full ${
                  ev.type === 'Wedding' ? 'bg-[#C9A25D]' : 
                  ev.type === 'Kitchen' ? 'bg-stone-400' : 'bg-stone-600 dark:bg-stone-300'
                }`}></div>
                <span className={`text-[9px] truncate w-full ${theme.subText} hidden md:block`}>
                  {ev.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    return days;
  };

  const changeMonth = (offset) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  return (
    <div className={`flex h-screen w-full overflow-hidden font-sans ${theme.bg} ${theme.text} selection:bg-[#C9A25D] selection:text-white`}>
      
      {/* Global Styles to ensure match */}
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
          activeTab="Events Calendar"
          theme={theme}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        <div className="flex-1 overflow-y-auto p-6 md:p-8 no-scrollbar">
          
          <FadeIn>
            <div className="flex flex-col lg:flex-row gap-8 h-full">
              
              {/* --- LEFT: Calendar Grid --- */}
              <div className="flex-1 flex flex-col h-full">
                {/* Calendar Header */}
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <span className={`text-[10px] uppercase tracking-[0.2em] ${theme.subText}`}>Schedule</span>
                    <h2 className="font-serif text-3xl md:text-4xl italic mt-1">
                      {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                    </h2>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className={`flex border ${theme.border} rounded-sm overflow-hidden`}>
                      <button onClick={() => changeMonth(-1)} className={`p-2 hover:bg-[#C9A25D] hover:text-white transition-colors ${theme.subText}`}>
                        <ChevronLeft size={18} strokeWidth={1} />
                      </button>
                      <div className={`w-[1px] ${theme.border}`}></div>
                      <button onClick={() => changeMonth(1)} className={`p-2 hover:bg-[#C9A25D] hover:text-white transition-colors ${theme.subText}`}>
                        <ChevronRight size={18} strokeWidth={1} />
                      </button>
                    </div>
                    <button className="flex items-center gap-2 bg-[#1c1c1c] text-white px-4 py-2 text-[10px] uppercase tracking-widest hover:bg-[#C9A25D] transition-colors">
                      <Plus size={14} /> New Event
                    </button>
                  </div>
                </div>

                {/* Grid Container */}
                <div className={`border-t border-l ${theme.border} bg-${theme.cardBg}`}>
                  {/* Days Header */}
                  <div className="grid grid-cols-7">
                    {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                      <div key={day} className={`py-3 text-center text-[10px] tracking-[0.2em] ${theme.subText} border-b border-r ${theme.border} bg-stone-50 dark:bg-[#1a1a1a]`}>
                        {day}
                      </div>
                    ))}
                  </div>
                  
                  {/* Calendar Cells */}
                  <div className="grid grid-cols-7">
                    {renderCalendarGrid()}
                  </div>
                </div>
              </div>

              {/* --- RIGHT: Agenda / Details Panel --- */}
              <div className="w-full lg:w-80 flex-shrink-0">
                <div className={`h-full border ${theme.border} ${theme.cardBg} p-6 flex flex-col`}>
                  
                  <div className="mb-8">
                    <span className={`text-[10px] uppercase tracking-[0.2em] ${theme.subText}`}>Selected Date</span>
                    <h3 className="font-serif text-3xl mt-2">
                      {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                    </h3>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-4 no-scrollbar">
                    {getEventsForDay(selectedDate).length > 0 ? (
                      getEventsForDay(selectedDate).map((event) => (
                        <div 
                          key={event.id} 
                          className={`p-4 border ${theme.border} hover:border-[#C9A25D]/50 transition-all group cursor-pointer`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className={`text-[10px] uppercase px-2 py-0.5 rounded-full border ${
                              event.type === 'Wedding' ? 'text-[#C9A25D] border-[#C9A25D]/30' : 
                              event.type === 'Kitchen' ? 'text-stone-400 border-stone-400/30' : 
                              'text-blue-400 border-blue-400/30'
                            }`}>
                              {event.type}
                            </span>
                            <button className="text-stone-400 hover:text-[#C9A25D]">
                              <MoreHorizontal size={14} />
                            </button>
                          </div>
                          
                          <h4 className="font-serif text-lg leading-tight mb-3 group-hover:text-[#C9A25D] transition-colors">
                            {event.title}
                          </h4>
                          
                          <div className="space-y-2">
                            <div className={`flex items-center gap-2 text-xs ${theme.subText}`}>
                              <Clock size={12} /> {event.time}
                            </div>
                            {event.guests > 0 && (
                              <div className={`flex items-center gap-2 text-xs ${theme.subText}`}>
                                <Users size={12} /> {event.guests} Guests
                              </div>
                            )}
                            <div className={`flex items-center gap-2 text-xs ${theme.subText}`}>
                               <MapPin size={12} /> {event.type === 'Kitchen' ? 'Main Kitchen' : 'Grand Ballroom'}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="h-40 flex flex-col items-center justify-center text-stone-400 border border-dashed border-stone-200 dark:border-stone-800">
                        <span className="font-serif italic text-lg">No events</span>
                        <span className="text-[10px] uppercase tracking-wider mt-1">Free Schedule</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 pt-6 border-t border-stone-100 dark:border-stone-800">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xs font-medium">Upcoming This Week</span>
                      <Filter size={14} className="text-stone-400 cursor-pointer" />
                    </div>
                    <div className="space-y-3">
                      {[
                        { label: 'Tastings', count: 2, color: 'bg-stone-400' },
                        { label: 'Weddings', count: 1, color: 'bg-[#C9A25D]' },
                      ].map((stat, i) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${stat.color}`}></div>
                            <span className={theme.subText}>{stat.label}</span>
                          </div>
                          <span>{stat.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </FadeIn>

        </div>
      </main>
    </div>
  );
};

export default CalendarPage;
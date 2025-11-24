import React, { useState, useEffect, useRef } from 'react';
import { 
  ChefHat, Flame, Utensils, AlertTriangle, 
  CheckCircle, Clock, Calendar, Printer, 
  MoreHorizontal, ArrowRight, ArrowUpDown,
  CircleDashed
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

const Kitchen = () => {
  // --- Persistence Logic ---
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const savedState = localStorage.getItem('sidebarState');
    return savedState !== null ? savedState === 'true' : true;
  });

  const [activeTab, setActiveTab] = useState('Kitchen & Prep');
  const [searchQuery, setSearchQuery] = useState("");
  const [stationFilter, setStationFilter] = useState("All");

  // Theme Sync
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
    subText: darkMode ? 'text-stone-500' : 'text-stone-400',
    border: darkMode ? 'border-stone-800' : 'border-stone-100',
    accent: 'text-[#C9A25D]',
    hoverBg: darkMode ? 'hover:bg-stone-900' : 'hover:bg-[#faf8f5]',
  };

  // --- Mock Data: Prep Tasks ---
  const prepTasks = [
    { id: 1, item: 'Truffle Mushroom Risotto', event: 'Alcantara Wedding', station: 'Hot Line', chef: 'Marco', status: 'In Progress', due: '4:00 PM' },
    { id: 2, item: 'Wagyu Beef Sliders', event: 'TechSolutions Gala', station: 'Grill', chef: 'Sarah', status: 'Pending', due: '6:00 PM' },
    { id: 3, item: 'Seasonal Fruit Platters', event: 'Alcantara Wedding', station: 'Garde Manger', chef: 'Luis', status: 'Completed', due: '2:00 PM' },
    { id: 4, item: 'Dark Chocolate Ganache', event: 'TechSolutions Gala', station: 'Pastry', chef: 'Elena', status: 'In Progress', due: '5:30 PM' },
    { id: 5, item: 'Herb Crusted Salmon', event: 'Private Dinner', station: 'Hot Line', chef: 'Marco', status: 'Pending', due: '7:00 PM' },
    { id: 6, item: 'Caprese Skewers', event: 'Alcantara Wedding', station: 'Garde Manger', chef: 'Luis', status: 'Completed', due: '3:00 PM' },
  ];

  // --- Mock Data: Dietary Alerts ---
  const dietaryAlerts = [
    { id: 1, event: 'Alcantara Wedding', type: 'Severe Nut Allergy', count: 2, table: 'Table 4' },
    { id: 2, event: 'TechSolutions Gala', type: 'Gluten Free', count: 15, table: 'Various' },
    { id: 3, event: 'Private Dinner', type: 'Shellfish Allergy', count: 1, table: 'VIP' },
  ];

  const filteredTasks = prepTasks.filter(task => 
    (stationFilter === "All" || task.station === stationFilter) &&
    (task.item.toLowerCase().includes(searchQuery.toLowerCase()) || task.event.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // --- Helper: Status Styles (Updated to Rectangular Box Style) ---
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return (
          <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-emerald-600 bg-emerald-500/10 px-3 py-1.5 rounded-sm font-medium border border-emerald-500/10">
            <CheckCircle size={11} /> {status}
          </span>
        );
      case 'In Progress':
        return (
          <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-amber-600 bg-amber-500/10 px-3 py-1.5 rounded-sm font-medium border border-amber-500/10">
            <Clock size={11} /> {status}
          </span>
        );
      default:
        return (
          <span className={`flex items-center gap-1.5 text-[10px] uppercase tracking-widest ${theme.subText} bg-stone-100 dark:bg-stone-800 px-3 py-1.5 rounded-sm font-medium border border-stone-200 dark:border-stone-700`}>
            <CircleDashed size={11} /> {status}
          </span>
        );
    }
  };

  return (
    <div className={`flex h-screen w-full overflow-hidden font-sans ${theme.bg} ${theme.text} selection:bg-[#C9A25D] selection:text-white transition-colors duration-500`}>
      
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=Inter:wght@300;400;500&display=swap');
        .font-serif { font-family: 'Cormorant Garamond', serif; }
        .font-sans { font-family: 'Inter', sans-serif; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>

      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} activeTab={activeTab} setActiveTab={setActiveTab} theme={theme} />

      <main className="flex-1 flex flex-col relative overflow-hidden">
        <DashboardNavbar activeTab="Kitchen & Prep" theme={theme} darkMode={darkMode} setDarkMode={setDarkMode} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

        <div className="flex-1 overflow-y-auto p-6 md:p-12 scroll-smooth no-scrollbar">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
            <div>
              <h2 className="font-serif text-3xl italic">Daily Production</h2>
              <p className={`text-xs mt-1 ${theme.subText}`}>Today's Prep Sheet • 3 Active Events</p>
            </div>
            <div className="flex gap-3">
              <button className={`flex items-center gap-2 px-4 py-2.5 border ${theme.border} text-[10px] uppercase tracking-widest hover:text-[#C9A25D] transition-colors bg-transparent`}>
                <Printer size={14} /> Print Prep Sheet
              </button>
              <button className="flex items-center gap-2 bg-[#1c1c1c] text-white px-6 py-2.5 text-[10px] uppercase tracking-widest hover:bg-[#C9A25D] transition-colors">
                <Utensils size={14} /> New Recipe
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            {[
              { label: 'Active Chefs', value: '12', sub: 'On Shift', icon: ChefHat },
              { label: 'Dishes Queued', value: '45', sub: 'To Prepare', icon: Utensils },
              { label: 'Dietary Flags', value: '03', sub: 'Action Required', icon: AlertTriangle, isAlert: true },
              { label: 'Kitchen Efficiency', value: '94%', sub: 'On Time', icon: Flame },
            ].map((stat, idx) => (
              <FadeIn key={idx} delay={idx * 100}>
                <div className={`p-6 border ${theme.border} ${theme.cardBg} group hover:border-[#C9A25D]/30 transition-all duration-500 flex flex-col justify-between h-32 rounded-sm`}>
                  <div className="flex justify-between items-start">
                    <span className={`text-[10px] uppercase tracking-[0.2em] ${theme.subText}`}>{stat.label}</span>
                    <stat.icon size={16} strokeWidth={1} className={stat.isAlert ? "text-red-500" : "text-[#C9A25D] opacity-80"} />
                  </div>
                  <div className="flex items-baseline justify-between">
                    <h3 className="font-serif text-3xl md:text-4xl">{stat.value}</h3>
                    <span className={`text-xs ${theme.subText}`}>{stat.sub}</span>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
            
            {/* Prep Board Table */}
            <div className="lg:col-span-2">
              <FadeIn delay={300}>
                <div className={`border ${theme.border} ${theme.cardBg} min-h-[600px] flex flex-col rounded-sm`}>
                  
                  {/* Toolbar */}
                  <div className="p-6 md:p-8 border-b border-stone-100 dark:border-stone-800 flex flex-wrap justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif text-2xl italic">Prep Board</h3>
                      <span className={`text-xs ${theme.subText} ml-2 pt-1`}>{filteredTasks.length} Tasks</span>
                    </div>
                    <div className={`flex p-1 rounded-sm border ${theme.border} ${darkMode ? 'bg-stone-900' : 'bg-stone-50'}`}>
                      {['All', 'Hot Line', 'Grill', 'Pastry'].map(st => (
                        <button
                          key={st}
                          onClick={() => setStationFilter(st)}
                          className={`px-4 py-1.5 text-[10px] uppercase tracking-wider transition-all rounded-sm ${
                            stationFilter === st 
                            ? 'bg-[#C9A25D] text-white shadow-sm' 
                            : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-300'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Table Header */}
                  <div className={`
                    grid grid-cols-12 gap-4 px-8 py-4 
                    border-b ${theme.border} 
                    text-[10px] uppercase tracking-[0.2em] font-medium text-stone-400 select-none
                  `}>
                    <div className="col-span-5 md:col-span-4 flex items-center gap-2 cursor-pointer hover:text-[#C9A25D] transition-colors">
                      Task Item <ArrowUpDown size={10} className="opacity-50"/>
                    </div>
                    <div className="col-span-3 hidden md:block">Event Details</div>
                    <div className="col-span-3 md:col-span-2 text-right">Due By</div>
                    <div className="col-span-4 md:col-span-3 text-right">Status</div>
                  </div>

                  {/* Rows */}
                  <div className={`flex-1 overflow-y-auto divide-y ${darkMode ? 'divide-stone-800' : 'divide-stone-100'}`}>
                    {filteredTasks.map((task) => (
                      <div 
                        key={task.id} 
                        className={`grid grid-cols-12 gap-4 px-8 py-5 items-center group ${theme.hoverBg} transition-colors duration-300`}
                      >
                        {/* Task */}
                        <div className="col-span-5 md:col-span-4 flex items-start gap-3">
                          <div className={`mt-1 w-4 h-4 rounded-full border ${theme.border} flex-shrink-0 flex items-center justify-center cursor-pointer hover:border-[#C9A25D] transition-colors`}>
                            {task.status === 'Completed' && <div className="w-2.5 h-2.5 rounded-full bg-[#C9A25D]"></div>}
                          </div>
                          <div>
                            <h4 className={`font-serif text-lg leading-none mb-1.5 transition-opacity ${task.status === 'Completed' ? 'line-through opacity-50' : ''}`}>
                              {task.item}
                            </h4>
                            <span className={`text-[10px] uppercase tracking-widest ${theme.subText} border border-stone-200 dark:border-stone-800 px-2 py-0.5 rounded-full`}>
                              {task.station}
                            </span>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="col-span-3 hidden md:block space-y-1">
                          <div className="flex items-center gap-2 text-xs text-stone-500">
                            <Calendar size={10} /> <span className="truncate">{task.event}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-stone-400">
                            <ChefHat size={10} /> <span>Chef {task.chef}</span>
                          </div>
                        </div>

                        {/* Due */}
                        <div className={`col-span-3 md:col-span-2 text-right font-mono text-xs ${theme.subText}`}>
                          {task.due}
                        </div>

                        {/* Status & Action */}
                        <div className="col-span-4 md:col-span-3 flex justify-end items-center gap-4">
                          
                          {/* Updated Rectangular Status Badge */}
                          {renderStatusBadge(task.status)}
                          
                          <button className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-[#C9A25D] ${theme.subText}`}>
                            <MoreHorizontal size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    {filteredTasks.length === 0 && (
                      <div className="h-64 flex flex-col items-center justify-center text-stone-300 dark:text-stone-700">
                        <CheckCircle size={48} strokeWidth={1} className="mb-4 opacity-50" />
                        <p className="font-serif text-lg">All tasks cleared.</p>
                      </div>
                    )}
                  </div>
                </div>
              </FadeIn>
            </div>

            {/* Sidebar Widgets */}
            <div className="lg:col-span-1 space-y-8">
              <FadeIn delay={400}>
                <div className={`border ${theme.border} ${theme.cardBg} p-6 rounded-sm`}>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-serif text-xl italic">Dietary Watchlist</h3>
                    <AlertTriangle size={16} className="text-red-500" />
                  </div>
                  <div className="space-y-3">
                    {dietaryAlerts.map((alert) => (
                      <div key={alert.id} className={`p-4 border-l-2 border-red-500 ${darkMode ? 'bg-red-900/10' : 'bg-red-50'} rounded-r-sm`}>
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-bold uppercase text-red-600 dark:text-red-400 tracking-wider">{alert.type}</span>
                          <span className={`text-[10px] font-mono ${darkMode ? 'bg-black border-red-900' : 'bg-white border-red-100'} px-2 py-0.5 rounded border`}>
                            {alert.count} Guest{alert.count > 1 ? 's' : ''}
                          </span>
                        </div>
                        <p className={`text-sm font-serif mt-2 ${theme.text}`}>{alert.event}</p>
                        <p className="text-[10px] text-stone-400 mt-1">Location: {alert.table}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeIn>

              <FadeIn delay={500}>
                <div className={`border ${theme.border} ${theme.cardBg} p-6 rounded-sm`}>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-serif text-xl italic">Active Menu</h3>
                    <ArrowRight size={16} className={theme.subText} />
                  </div>
                  <div className="space-y-4">
                    {[
                      { name: 'Pan Seared Scallops', station: 'Hot Line', img: 'https://images.pexels.com/photos/15455228/pexels-photo-15455228.jpeg?auto=compress&cs=tinysrgb&w=800' },
                      { name: 'Truffle Beef Wellington', station: 'Hot Line', img: 'https://images.pexels.com/photos/6210876/pexels-photo-6210876.jpeg?auto=compress&cs=tinysrgb&w=800' },
                      { name: 'Matcha Tiramisu', station: 'Pastry', img: 'https://images.pexels.com/photos/14051364/pexels-photo-14051364.jpeg?auto=compress&cs=tinysrgb&w=800' },
                    ].map((recipe, i) => (
                      <div key={i} className="flex items-center gap-4 group cursor-pointer">
                        <div className="w-12 h-12 rounded-sm overflow-hidden relative">
                          <img src={recipe.img} alt={recipe.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        </div>
                        <div className="flex-1">
                          <h4 className={`font-serif text-md group-hover:text-[#C9A25D] transition-colors ${theme.text}`}>
                            {recipe.name}
                          </h4>
                          <span className={`text-[10px] uppercase tracking-widest ${theme.subText}`}>{recipe.station}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className={`w-full mt-6 py-3 border ${theme.border} text-[10px] uppercase tracking-widest hover:bg-[#C9A25D] hover:text-white hover:border-[#C9A25D] transition-all`}>
                    View All Recipes
                  </button>
                </div>
              </FadeIn>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default Kitchen;
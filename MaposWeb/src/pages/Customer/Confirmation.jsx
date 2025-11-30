import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, Printer } from 'lucide-react';
import Navbar from '../../components/customer/Navbar';
import Footer from '../../components/customer/Footer';

// Reuse the FadeIn component for consistency
const FadeIn = ({ children, delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    setTimeout(() => setIsVisible(true), delay);
  }, [delay]);
  return (
    <div className={`transition-all duration-1000 ease-out transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      {children}
    </div>
  );
};

const Confirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const bookingData = location.state || {}; 
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');

  // Theme Logic
  useEffect(() => {
    if (darkMode) { 
      document.documentElement.classList.add('dark'); 
      document.body.style.backgroundColor = '#0c0c0c'; 
    } else { 
      document.documentElement.classList.remove('dark'); 
      document.body.style.backgroundColor = '#FAFAFA'; 
    }
  }, [darkMode]);

  const theme = {
    bg: darkMode ? 'bg-[#0c0c0c]' : 'bg-[#FAFAFA]',
    cardBg: darkMode ? 'bg-[#111]' : 'bg-white',
    text: darkMode ? 'text-stone-200' : 'text-stone-900',
    subText: darkMode ? 'text-stone-400' : 'text-stone-500',
    border: darkMode ? 'border-stone-800' : 'border-stone-200',
    highlight: 'text-[#C9A25D]',
  };

  // Redirect if no data
  if (!bookingData.name) {
    setTimeout(() => navigate('/'), 3000);
    return (
      <div className={`h-screen flex items-center justify-center ${theme.bg} ${theme.text}`}>
        <p className="text-[10px] tracking-widest uppercase animate-pulse">Redirecting...</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen font-sans antialiased transition-colors duration-500 ${theme.bg} ${theme.text} selection:bg-[#C9A25D] selection:text-white flex flex-col`}>
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} isScrolled={true} />

      <main className="flex-grow flex items-center justify-center py-24 px-4">
        <div className="max-w-2xl w-full">
          
          <FadeIn>
            <div className="flex flex-col items-center text-center mb-8">
              {/* Smaller Gold Check Icon */}
              <div className={`w-16 h-16 rounded-full flex items-center justify-center border border-[#C9A25D]/30 bg-[#C9A25D]/5 mb-6 shadow-[0_0_20px_-5px_rgba(201,162,93,0.3)]`}>
                <CheckCircle className="w-6 h-6 text-[#C9A25D]" strokeWidth={1} />
              </div>

              <h1 className="font-serif text-3xl md:text-4xl mb-3 tracking-wide">Request Received</h1>
              <p className={`text-xs md:text-sm ${theme.subText} max-w-md leading-relaxed`}>
                Thank you, <span className={`${theme.text} font-medium`}>{bookingData.name}</span>. We have recorded your inquiry. A proposal will be sent shortly.
              </p>
            </div>
          </FadeIn>

          {/* Receipt / Summary Card - Compact Version */}
          <FadeIn delay={200}>
            <div className={`relative ${theme.cardBg} border ${theme.border} rounded-sm overflow-hidden transition-colors duration-500 group hover:border-[#C9A25D]/50`}>
              
              {/* Gold Accent Line */}
              <div className="absolute top-0 left-0 w-1 h-full bg-[#C9A25D]"></div>
              
              {/* Card Header - Smaller Padding */}
              <div className={`px-6 py-5 border-b ${theme.border} flex flex-col md:flex-row justify-between items-start md:items-center gap-3`}>
                 <div>
                   <p className="text-[9px] uppercase tracking-[0.2em] text-stone-400 mb-1">Reference ID</p>
                   <p className={`font-serif text-xl md:text-2xl ${theme.highlight} tracking-wide`}>{bookingData.refId}</p>
                 </div>
                 <div className="flex flex-col items-end">
                   <p className="text-[9px] uppercase tracking-[0.2em] text-stone-400 mb-1">Status</p>
                   <div className={`flex items-center gap-2 px-2 py-1 border border-[#C9A25D]/30 rounded-sm bg-[#C9A25D]/5`}>
                      <div className="w-1 h-1 rounded-full bg-[#C9A25D] animate-pulse"></div>
                      <span className="text-[9px] uppercase tracking-widest font-bold text-[#C9A25D]">Under Review</span>
                   </div>
                 </div>
              </div>

              {/* Card Body - Tighter Grid */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                 
                 {/* Column 1 */}
                 <div className="space-y-4">
                    <div>
                        <span className="block text-[9px] uppercase tracking-widest text-stone-400 mb-1">Event Type</span>
                        <span className={`text-xs font-medium ${theme.text}`}>{bookingData.eventType}</span>
                    </div>
                    <div>
                        <span className="block text-[9px] uppercase tracking-widest text-stone-400 mb-1">Venue</span>
                        <span className={`text-xs font-medium ${theme.text}`}>{bookingData.venue || "To Be Determined"}</span>
                    </div>
                    <div>
                        <span className="block text-[9px] uppercase tracking-widest text-stone-400 mb-1">Contact Email</span>
                        <span className={`text-xs font-medium ${theme.text}`}>{bookingData.email}</span>
                    </div>
                 </div>

                 {/* Column 2 */}
                 <div className="space-y-4">
                    <div>
                        <span className="block text-[9px] uppercase tracking-widest text-stone-400 mb-1">Date & Time</span>
                        <div className={`text-xs font-medium ${theme.text} flex items-center gap-2`}>
                            {bookingData.date}
                            <span className="text-[#C9A25D]">•</span>
                            {bookingData.startTime} - {bookingData.endTime}
                        </div>
                    </div>
                    <div>
                        <span className="block text-[9px] uppercase tracking-widest text-stone-400 mb-1">Guest Count</span>
                        <span className={`text-xs font-medium ${theme.text}`}>{bookingData.guests} Pax</span>
                    </div>
                    <div>
                        <span className="block text-[9px] uppercase tracking-widest text-stone-400 mb-1">Service Style</span>
                        <span className={`text-xs font-medium ${theme.text}`}>{bookingData.serviceStyle || "Standard Service"}</span>
                    </div>
                 </div>

                 {/* Full Width Note - Compact */}
                 {bookingData.notes && (
                   <div className={`col-span-1 md:col-span-2 pt-4 border-t border-dashed ${theme.border}`}>
                      <span className="block text-[9px] uppercase tracking-widest text-stone-400 mb-1">Additional Notes</span>
                      <p className={`text-xs italic ${theme.subText}`}>"{bookingData.notes}"</p>
                   </div>
                 )}
              </div>
            </div>
          </FadeIn>

          {/* Actions - Smaller Buttons */}
          <FadeIn delay={400}>
            <div className="mt-8 flex flex-col md:flex-row gap-3 justify-center">
              <button 
                onClick={() => window.print()} 
                className={`group flex items-center justify-center gap-2 px-6 py-3 border ${theme.border} ${theme.text} hover:border-[#C9A25D] hover:text-[#C9A25D] transition-all duration-300 text-[10px] uppercase tracking-[0.2em]`}
              >
                <Printer size={14} /> 
                <span>Print Receipt</span>
              </button>
              
              <button 
                onClick={() => navigate('/')} 
                className="flex items-center justify-center gap-2 px-8 py-3 bg-[#1c1c1c] text-white hover:bg-[#C9A25D] transition-all duration-300 text-[10px] uppercase tracking-[0.2em] shadow-lg"
              >
                <span>Return Home</span>
                <ArrowRight size={14} />
              </button>
            </div>
            
            <div className="mt-8 text-center">
                <p className="text-[9px] uppercase tracking-widest text-stone-500 opacity-60">
                    Need to make changes? <a href="#" className="underline hover:text-[#C9A25D] transition-colors">Contact Support</a>
                </p>
            </div>
          </FadeIn>

        </div>
      </main>

      <Footer darkMode={darkMode} />
    </div>
  );
};

export default Confirmation;
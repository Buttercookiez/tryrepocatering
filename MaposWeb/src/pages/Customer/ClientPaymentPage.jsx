import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios'; // ✅ Added Axios for Real API Calls
import { 
    ShieldCheck, CreditCard, Calendar, Users, ArrowRight, CheckCircle, 
    Download, Loader2, Lock, MapPin, Check, AlertCircle, Smartphone 
} from 'lucide-react';

// Use the existing service for fetching booking details
import { getBookingByRefId } from '../../api/bookingService'; 

// --- 1. UI ANIMATION WRAPPER ---
const FadeIn = ({ children, delay = 0, direction = 'up' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => {
      if (ref.current) observer.unobserve(ref.current);
    };
  }, []);

  const translateClass = direction === 'up' ? 'translate-y-10' : 'translate-x-0';

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out transform ${
        isVisible ? 'opacity-100 translate-y-0' : `opacity-0 ${translateClass}`
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

const ClientPaymentPage = () => {
    const { refId: rawParam } = useParams();
    const bookingId = rawParam ? rawParam.split('-').slice(0, 2).join('-') : null;
    const navigate = useNavigate();

    // Data State
    const [bookingData, setBookingData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Payment Logic State
    const [paymentStatus, setPaymentStatus] = useState("checking"); 
    const [gatewayStep, setGatewayStep] = useState(""); 
    
    // User Selections
    const [paymentType, setPaymentType] = useState("downpayment"); // 'downpayment' | 'full'
    const [paymentMethod, setPaymentMethod] = useState(null); // 'card' | 'wallet'

    // ===========================================
    // --- 1. FETCH BOOKING DATA ---
    // ===========================================
    useEffect(() => {
        const loadInvoice = async () => {
            if(!bookingId) {
                setError("Invalid Payment Link");
                setIsLoading(false);
                return;
            }

            try {
                const data = await getBookingByRefId(bookingId);
                
                if(!data) {
                    setError("Invoice Not Found. It may have expired.");
                    setIsLoading(false);
                    return;
                }

                const grandTotal = data.proposal?.costBreakdown?.grandTotal || data.payment?.totalCost || 0;
                const currentStatus = data.payment?.paymentStatus || "Unpaid";
                
                setBookingData({
                    refId: data.refId,
                    clientName: data.fullName || data.client,
                    eventDate: data.dateOfEvent || data.date,
                    venue: data.venueName || data.venue,
                    guests: data.estimatedGuests || data.guests || 0,
                    grandTotal: grandTotal,
                });

                if (currentStatus === "Paid" || currentStatus === "Partially Paid") {
                    setPaymentStatus("paid");
                } else {
                    setPaymentStatus("unpaid");
                }

            } catch (err) {
                console.error("Fetch Payment Error:", err);
                setError("System unable to retrieve invoice details.");
            } finally {
                setIsLoading(false);
            }
        };

        loadInvoice();
    }, [bookingId]);

    // ===========================================
    // --- 2. CALCULATE AMOUNT ---
    // ===========================================
    const getPayableAmount = () => {
        if(!bookingData) return 0;
        return paymentType === 'downpayment' ? bookingData.grandTotal * 0.5 : bookingData.grandTotal;
    };

    // ===========================================
    // --- 3. PAYMONGO INTEGRATION (REAL LOGIC) ---
    // ===========================================
    const handlePayment = async () => {
        if(!paymentMethod) return alert("Please select a payment method.");

        setPaymentStatus("processing");
        setGatewayStep("Connecting to Secure Gateway...");

        const amountInPhp = getPayableAmount();
        
        // PayMongo expects amount in CENTAVOS (e.g., 100 PHP = 10000 centavos)
        // Make sure your backend expects centavos or adjust this line accordingly
        const amountInCentavos = amountInPhp * 100;

        try {
            await new Promise(resolve => setTimeout(resolve, 800));
            setGatewayStep(`Initializing ${paymentMethod === 'card' ? 'Card' : 'E-Wallet'} Transaction...`);
            
            console.log("💳 Initiating PayMongo Session:", {
                amount: amountInCentavos,
                desc: `Payment for ${bookingData.refId}`
            });

            // ✅ REAL API CALL TO YOUR BACKEND
            const response = await axios.post(
                "http://localhost:5000/api/paymongo/create-checkout-session", 
                {
                    amount: amountInCentavos, 
                    description: `${paymentType === 'downpayment' ? '50% Downpayment' : 'Full Payment'} - Ref: ${bookingData.refId}`,
                    remarks: `Client: ${bookingData.clientName}`
                }
            );

            const { checkout_url } = response.data;
            
            if (checkout_url) {
                setGatewayStep("Redirecting to Payment Page...");
                await new Promise(resolve => setTimeout(resolve, 1000));
                // ✅ Redirect user to PayMongo
                window.location.href = checkout_url;
            } else {
                throw new Error("No checkout URL returned");
            }

        } catch (err) {
            console.error("Payment Error:", err);
            setPaymentStatus("unpaid");
            alert("Unable to connect to payment gateway. Please try again.");
        }
    };

    // ===========================================
    // --- UI HELPERS ---
    // ===========================================
    const GlobalStyles = () => (
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=Inter:wght@300;400;500&display=swap');
          .font-serif { font-family: 'Cormorant Garamond', serif; }
          .font-sans { font-family: 'Inter', sans-serif; }
          /* Fix for the flickering text issue */
          body { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
        `}</style>
    );

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center">
                <GlobalStyles />
                <Loader2 className="animate-spin text-[#C9A25D] mb-4" size={30}/>
                <p className="text-[#C9A25D] text-xs tracking-[0.3em] uppercase animate-pulse">Retrieving Invoice...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center p-6 text-center">
                <GlobalStyles />
                <AlertCircle className="text-red-400 mb-4" size={40} />
                <h2 className="font-serif text-2xl text-stone-800">{error}</h2>
                <button onClick={() => navigate('/')} className="mt-6 text-xs tracking-[0.2em] uppercase border-b border-stone-300 pb-1 hover:text-[#C9A25D] hover:border-[#C9A25D] transition-colors">
                    Return Home
                </button>
            </div>
        );
    }

    // --- ALREADY PAID VIEW ---
    if(paymentStatus === "paid") {
        return (
            <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center p-6 relative overflow-hidden">
                <GlobalStyles />
                <FadeIn>
                    <div className="bg-white w-full max-w-lg shadow-2xl p-12 text-center relative z-10 border-t-4 border-[#C9A25D]">
                        <div className="w-20 h-20 rounded-full border border-[#C9A25D]/30 flex items-center justify-center mx-auto mb-8 bg-[#C9A25D]/5">
                            <Check className="text-[#C9A25D]" size={40}/>
                        </div>
                        
                        <p className="text-[#C9A25D] text-xs tracking-[0.3em] uppercase mb-2">Transaction Successful</p>
                        <h1 className="font-serif text-4xl text-stone-800 mb-6">Payment Verified</h1>
                        
                        <div className="py-8 border-y border-stone-100 mb-8 space-y-2">
                             <p className="text-stone-500 font-sans text-sm">Reference: <span className="text-stone-900 font-medium">{bookingData.refId}</span></p>
                             <p className="text-stone-500 font-sans text-sm">Total Amount: <span className="text-stone-900 font-medium">₱ {bookingData.grandTotal.toLocaleString()}</span></p>
                        </div>
                        
                        <button className="w-full py-4 border border-stone-200 text-stone-500 text-xs tracking-[0.2em] uppercase hover:bg-stone-50 transition-colors flex items-center justify-center gap-2 group">
                            <Download size={14} className="group-hover:-translate-y-0.5 transition-transform"/> Download Receipt
                        </button>
                    </div>
                </FadeIn>
            </div>
        );
    }

    // --- MAIN PAYMENT FORM ---
    const downpaymentAmount = bookingData.grandTotal * 0.5;
    const fullAmount = bookingData.grandTotal;
    const currentAmount = getPayableAmount();

    return (
        <div className="min-h-screen bg-[#F4F2EF] font-sans selection:bg-[#C9A25D] selection:text-white flex items-center justify-center p-4 md:p-8">
            <GlobalStyles />
            
            <div className="w-full max-w-6xl bg-white shadow-2xl flex flex-col lg:flex-row overflow-hidden min-h-[700px] rounded-sm">
                
                {/* --- LEFT: INVOICE DETAILS (Dark Luxury Theme) --- */}
                <div className="lg:w-5/12 bg-[#1c1c1c] text-white p-10 md:p-14 relative flex flex-col justify-between">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>
                    
                    {/* Header */}
                    <FadeIn delay={0}>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-8 opacity-80">
                                <ShieldCheck size={16} className="text-[#C9A25D]"/>
                                <span className="text-[10px] tracking-[0.3em] uppercase text-stone-400">Secure Invoice</span>
                            </div>
                            <h2 className="font-serif text-4xl md:text-5xl leading-tight mb-2">
                                {bookingData.clientName}
                            </h2>
                            <p className="text-stone-500 font-mono text-sm tracking-wide">Ref: {bookingData.refId}</p>
                        </div>
                    </FadeIn>

                    {/* Details Grid */}
                    <FadeIn delay={200}>
                        <div className="space-y-8 relative z-10 my-12">
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-full border border-stone-700 flex items-center justify-center shrink-0">
                                    <Calendar size={18} className="text-[#C9A25D]"/>
                                </div>
                                <div>
                                    <span className="block text-[10px] uppercase text-stone-500 tracking-widest mb-1">Date</span>
                                    <span className="font-serif text-xl">{bookingData.eventDate}</span>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-full border border-stone-700 flex items-center justify-center shrink-0">
                                    <MapPin size={18} className="text-[#C9A25D]"/>
                                </div>
                                <div>
                                    <span className="block text-[10px] uppercase text-stone-500 tracking-widest mb-1">Venue</span>
                                    <span className="font-serif text-xl">{bookingData.venue}</span>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-full border border-stone-700 flex items-center justify-center shrink-0">
                                    <Users size={18} className="text-[#C9A25D]"/>
                                </div>
                                <div>
                                    <span className="block text-[10px] uppercase text-stone-500 tracking-widest mb-1">Guests</span>
                                    <span className="font-serif text-xl">{bookingData.guests} Pax</span>
                                </div>
                            </div>
                        </div>
                    </FadeIn>

                    {/* Footer Total */}
                    <FadeIn delay={400}>
                        <div className="pt-8 border-t border-stone-800 relative z-10">
                            <p className="text-[10px] uppercase text-stone-500 tracking-widest mb-2">Total Contract Value</p>
                            <p className="font-serif text-3xl text-white/90">₱ {bookingData.grandTotal.toLocaleString()}</p>
                        </div>
                    </FadeIn>
                </div>

                {/* --- RIGHT: PAYMENT ACTION (Light Clean Theme) --- */}
                <div className="lg:w-7/12 bg-white p-10 md:p-14 relative flex flex-col justify-center">
                    
                    {/* Processing Overlay */}
                    {paymentStatus === "processing" && (
                         <div className="absolute inset-0 bg-white/95 z-20 flex flex-col items-center justify-center animate-in fade-in">
                             <Loader2 size={40} className="text-[#C9A25D] animate-spin mb-4"/>
                             <p className="text-xs font-bold uppercase tracking-[0.2em] text-stone-800 animate-pulse">{gatewayStep}</p>
                             <p className="text-[10px] text-stone-400 mt-2">Please do not close this window</p>
                         </div>
                     )}

                    <FadeIn delay={300}>
                        <div className="mb-10">
                            <h3 className="font-serif text-3xl md:text-4xl text-stone-900 mb-4">Payment Details</h3>
                            <p className="text-stone-500 font-light text-sm">Please select your payment preference to proceed.</p>
                        </div>
                    </FadeIn>

                    {/* 1. Payment Type Selector */}
                    <FadeIn delay={400}>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-bold mb-4">Select Amount</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                             
                             {/* OPTION: DOWNPAYMENT */}
                             <div 
                                onClick={() => setPaymentType('downpayment')}
                                className={`cursor-pointer p-5 border transition-all duration-300 group relative ${
                                    paymentType === 'downpayment' 
                                    ? 'border-[#C9A25D] bg-[#FFFDF8]' 
                                    : 'border-stone-200 hover:border-stone-400'
                                }`}
                             >
                                 <div className="flex justify-between items-start mb-3">
                                     <span className={`text-[10px] uppercase font-bold tracking-widest ${paymentType === 'downpayment' ? 'text-[#C9A25D]' : 'text-stone-400'}`}>Downpayment</span>
                                     {paymentType === 'downpayment' && <div className="w-4 h-4 rounded-full bg-[#C9A25D] flex items-center justify-center"><Check size={10} className="text-white"/></div>}
                                 </div>
                                 <div className="text-2xl font-serif text-stone-800">₱ {downpaymentAmount.toLocaleString()}</div>
                                 <p className="text-[10px] text-stone-400 mt-2 font-light">50% Reservation Fee</p>
                             </div>

                             {/* OPTION: FULL PAYMENT */}
                             <div 
                                onClick={() => setPaymentType('full')}
                                className={`cursor-pointer p-5 border transition-all duration-300 group relative ${
                                    paymentType === 'full' 
                                    ? 'border-[#C9A25D] bg-[#FFFDF8]' 
                                    : 'border-stone-200 hover:border-stone-400'
                                }`}
                             >
                                 <div className="flex justify-between items-start mb-3">
                                     <span className={`text-[10px] uppercase font-bold tracking-widest ${paymentType === 'full' ? 'text-[#C9A25D]' : 'text-stone-400'}`}>Full Payment</span>
                                     {paymentType === 'full' && <div className="w-4 h-4 rounded-full bg-[#C9A25D] flex items-center justify-center"><Check size={10} className="text-white"/></div>}
                                 </div>
                                 <div className="text-2xl font-serif text-stone-800">₱ {fullAmount.toLocaleString()}</div>
                                 <p className="text-[10px] text-stone-400 mt-2 font-light">Clear Total Balance</p>
                             </div>
                        </div>
                    </FadeIn>

                    {/* 2. Payment Method Selector */}
                    <FadeIn delay={500}>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-bold mb-4">Payment Method</p>
                        <div className="grid grid-cols-2 gap-4 mb-10">
                             <button 
                                onClick={() => setPaymentMethod('card')}
                                className={`flex flex-col items-center justify-center gap-3 border py-6 transition-all duration-300 ${
                                    paymentMethod === 'card' 
                                    ? 'border-[#C9A25D] bg-stone-50 text-stone-900 shadow-inner' 
                                    : 'border-stone-200 text-stone-400 hover:border-stone-400 hover:text-stone-600'
                                }`}
                             >
                                 <CreditCard strokeWidth={1.5} size={24}/> 
                                 <span className="text-[10px] uppercase tracking-widest font-bold">Credit Card</span>
                             </button>

                             <button 
                                onClick={() => setPaymentMethod('wallet')}
                                className={`flex flex-col items-center justify-center gap-3 border py-6 transition-all duration-300 ${
                                    paymentMethod === 'wallet' 
                                    ? 'border-[#C9A25D] bg-stone-50 text-stone-900 shadow-inner' 
                                    : 'border-stone-200 text-stone-400 hover:border-stone-400 hover:text-stone-600'
                                }`}
                             >
                                 <Smartphone strokeWidth={1.5} size={24}/> 
                                 <span className="text-[10px] uppercase tracking-widest font-bold">GCash / Maya</span>
                             </button>
                        </div>
                    </FadeIn>

                    {/* 3. Action Button */}
                    <FadeIn delay={600}>
                        <div className="flex items-center justify-between mb-6">
                            <span className="text-stone-400 text-xs font-serif italic">Total Due Now</span>
                            <span className="text-3xl font-serif text-stone-900">₱ {currentAmount.toLocaleString()}</span>
                        </div>

                        <button 
                            onClick={handlePayment} 
                            disabled={!paymentMethod}
                            className={`w-full py-5 text-xs font-bold uppercase tracking-[0.25em] transition-all duration-500 shadow-xl flex items-center justify-center gap-4 group ${
                                paymentMethod 
                                ? 'bg-[#1c1c1c] text-white hover:bg-[#C9A25D]' 
                                : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                            }`}
                        >
                            Complete Transaction <ArrowRight size={16} className={`transition-transform ${paymentMethod ? 'group-hover:translate-x-1' : ''}`}/>
                        </button>
                        
                        <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-stone-400 uppercase tracking-wider">
                            <Lock size={12}/> Secure 256-Bit SSL Encrypted
                        </div>
                    </FadeIn>
                </div>
            </div>
        </div>
    );
};

export default ClientPaymentPage;
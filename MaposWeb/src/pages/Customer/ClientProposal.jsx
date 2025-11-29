// src/pages/Customer/ClientProposal.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Loader2, Check, Calendar, Users, MapPin, 
  ArrowRight, Utensils, Moon, Sun, ChevronDown, 
  Plus, CheckCircle, ArrowLeft, FileText, Download, User, Info, CreditCard
} from 'lucide-react';
import { getBookingByRefId, acceptProposal } from '../../api/bookingService';
import html2pdf from 'html2pdf.js';

// --- DATA CONFIGURATION ---

const ADD_ONS = [
  { 
    id: 'lechon', 
    name: "Whole Roasted Lechon", 
    price: 15000, 
    type: 'fixed', 
    img: "https://images.pexels.com/photos/7613568/pexels-photo-7613568.jpeg?auto=compress&cs=tinysrgb&w=800" 
  },
  { 
    id: 'mobile_bar', 
    name: "Mobile Cocktail Bar (4 Hours)", 
    price: 25000, 
    type: 'fixed', 
    img: "https://images.pexels.com/photos/1304540/pexels-photo-1304540.jpeg?auto=compress&cs=tinysrgb&w=800" 
  },
  { 
    id: 'grazing', 
    name: "Grazing Table (Charcuterie)", 
    price: 500, 
    type: 'per_head', 
    img: "https://images.pexels.com/photos/196643/pexels-photo-196643.jpeg?auto=compress&cs=tinysrgb&w=800" 
  },
];

const PACKAGES = [
  {
    id: 'classic',
    name: "Classic Buffet",
    price: 1200, 
    description: "A delightful spread of local and international favorites served buffet style.",
    highlight: false,
    features: ["Full Buffet Setup", "Uniformed Waitstaff", "Basic Centerpieces", "4 Hours Service"],
    menu: [
      {
        category: "Appetizers",
        items: [
          { name: "Tomato Basil Bruschetta", desc: "Toasted baguette, fresh tomatoes, balsamic glaze.", img: "https://images.pexels.com/photos/4193873/pexels-photo-4193873.jpeg?auto=compress&cs=tinysrgb&w=600" },
          { name: "Crispy Spring Rolls", desc: "Pork and vegetable filling with sweet chili dip.", img: "https://images.pexels.com/photos/1618915/pexels-photo-1618915.jpeg?auto=compress&cs=tinysrgb&w=600" }
        ]
      },
      {
        category: "Soup & Salad",
        items: [
          { name: "Cream of Pumpkin", desc: "Roasted pumpkin soup with croutons.", img: "https://images.pexels.com/photos/539451/pexels-photo-539451.jpeg?auto=compress&cs=tinysrgb&w=600" },
          { name: "Asian Chicken Salad", desc: "Sesame dressing, wonton strips, mixed greens.", img: "https://images.pexels.com/photos/1059905/pexels-photo-1059905.jpeg?auto=compress&cs=tinysrgb&w=600" }
        ]
      },
      {
        category: "Main Course",
        items: [
          { name: "Roast Beef with Mushroom", desc: "Slow-roasted beef slices in gravy.", img: "https://images.pexels.com/photos/1633525/pexels-photo-1633525.jpeg?auto=compress&cs=tinysrgb&w=600" },
          { name: "Parmesan Crusted Fish", desc: "Cream dory fillet with lemon butter sauce.", img: "https://images.pexels.com/photos/8402204/pexels-photo-8402204.jpeg?auto=compress&cs=tinysrgb&w=600" },
          { name: "Herb Roasted Chicken", desc: "Oven-baked chicken with rosemary and thyme.", img: "https://images.pexels.com/photos/6210876/pexels-photo-6210876.jpeg?auto=compress&cs=tinysrgb&w=600" }
        ]
      },
      {
        category: "Sides & Rice",
        items: [
          { name: "Steamed Jasmine Rice", desc: "Fragrant white rice.", img: "https://images.pexels.com/photos/723198/pexels-photo-723198.jpeg?auto=compress&cs=tinysrgb&w=600" },
          { name: "Buttered Corn & Carrots", desc: "Sautéed in garlic butter.", img: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=600" }
        ]
      },
      {
        category: "Desserts",
        items: [
          { name: "Chocolate Brownies", desc: "Fudgy brownies with walnuts.", img: "https://images.pexels.com/photos/3026804/pexels-photo-3026804.jpeg?auto=compress&cs=tinysrgb&w=600" },
          { name: "Panna Cotta", desc: "Creamy dessert with fruit toppings.", img: "https://images.pexels.com/photos/1739097/pexels-photo-1739097.jpeg?auto=compress&cs=tinysrgb&w=600" }
        ]
      },
      {
        category: "Beverages",
        items: [
          { name: "House Iced Tea", desc: "Lemon infused iced tea, bottomless.", img: "https://images.pexels.com/photos/792613/pexels-photo-792613.jpeg?auto=compress&cs=tinysrgb&w=600" },
          { name: "Mineral Water", desc: "Served with lemon slices.", img: "https://images.pexels.com/photos/416528/pexels-photo-416528.jpeg?auto=compress&cs=tinysrgb&w=600" }
        ]
      }
    ]
  },
  {
    id: 'premium',
    name: "Premium Plated",
    price: 1800,
    description: "An elevated dining experience with sit-down plated service and premium cuts.",
    highlight: true,
    features: ["Plated Service", "VIP Table Styling", "Coffee Station", "5 Hours Service"],
    menu: [
       {
        category: "Appetizers",
        items: [
          { name: "Seared Scallops", desc: "Pan seared with truffle pea puree.", img: "https://images.pexels.com/photos/15793095/pexels-photo-15793095.jpeg?auto=compress&cs=tinysrgb&w=600" },
          { name: "Shrimp Cocktail", desc: "Tiger prawns with tangy cocktail sauce.", img: "https://images.pexels.com/photos/566344/pexels-photo-566344.jpeg?auto=compress&cs=tinysrgb&w=600" }
        ]
      },
      {
        category: "Soup & Salad",
        items: [
          { name: "Wild Mushroom Soup", desc: "Truffle oil drizzle and croutons.", img: "https://images.pexels.com/photos/5358737/pexels-photo-5358737.jpeg?auto=compress&cs=tinysrgb&w=600" },
          { name: "Greek Salad", desc: "Feta, olives, cucumber, vinaigrette.", img: "https://images.pexels.com/photos/1211887/pexels-photo-1211887.jpeg?auto=compress&cs=tinysrgb&w=600" }
        ]
      },
      {
        category: "Main Course",
        items: [
          { name: "Angus Ribeye Steak", desc: "Grilled medium rare with red wine jus.", img: "https://images.pexels.com/photos/361184/pexels-photo-361184.jpeg?auto=compress&cs=tinysrgb&w=600" },
          { name: "Pan Seared Salmon", desc: "Atlantic salmon with asparagus.", img: "https://images.pexels.com/photos/3763847/pexels-photo-3763847.jpeg?auto=compress&cs=tinysrgb&w=600" }
        ]
      },
      {
        category: "Sides",
        items: [
          { name: "Mashed Potato", desc: "Creamy buttery potato.", img: "https://images.pexels.com/photos/6287523/pexels-photo-6287523.jpeg?auto=compress&cs=tinysrgb&w=600" },
          { name: "Roasted Vegetables", desc: "Zucchini, peppers, and carrots.", img: "https://images.pexels.com/photos/5945568/pexels-photo-5945568.jpeg?auto=compress&cs=tinysrgb&w=600" }
        ]
      },
      {
        category: "Desserts",
        items: [
          { name: "New York Cheesecake", desc: "Blueberry topping.", img: "https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg?auto=compress&cs=tinysrgb&w=600" },
          { name: "Tiramisu", desc: "Espresso soaked ladyfingers.", img: "https://images.pexels.com/photos/6880218/pexels-photo-6880218.jpeg?auto=compress&cs=tinysrgb&w=600" }
        ]
      },
      {
        category: "Beverages",
        items: [
          { name: "Cucumber Lemonade", desc: "Freshly squeezed.", img: "https://images.pexels.com/photos/210906/pexels-photo-210906.jpeg?auto=compress&cs=tinysrgb&w=600" },
          { name: "Red & White Wine", desc: "One glass per guest.", img: "https://images.pexels.com/photos/2912467/pexels-photo-2912467.jpeg?auto=compress&cs=tinysrgb&w=600" },
          { name: "Brewed Coffee", desc: "Fresh arabica beans.", img: "https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg?auto=compress&cs=tinysrgb&w=600" }
        ]
      }
    ]
  },
  {
    id: 'signature',
    name: "Chef's Signature",
    price: 3500,
    description: "The ultimate luxury experience featuring our chef's tasting menu and wine pairing.",
    highlight: false,
    features: ["7-Course Degustation", "Wine Pairing", "Full Butler Service", "Luxury Styling", "Custom Backdrop"],
    menu: [
       {
        category: "Canapés",
        items: [
          { name: "Foie Gras Terrine", desc: "With fig jam and brioche.", img: "https://images.pexels.com/photos/461428/pexels-photo-461428.jpeg?auto=compress&cs=tinysrgb&w=600" },
          { name: "Caviar Blini", desc: "Premium caviar on mini pancakes.", img: "https://images.pexels.com/photos/18240507/pexels-photo-18240507.jpeg?auto=compress&cs=tinysrgb&w=600" }
        ]
      },
      {
        category: "Starters",
        items: [
          { name: "Tuna Tartare", desc: "Fresh tuna with avocado and sesame.", img: "https://images.pexels.com/photos/17650176/pexels-photo-17650176.jpeg?auto=compress&cs=tinysrgb&w=600" },
          { name: "Lobster Bisque", desc: "Creamy cognac infused soup.", img: "https://images.pexels.com/photos/5602502/pexels-photo-5602502.jpeg?auto=compress&cs=tinysrgb&w=600" }
        ]
      },
      {
        category: "The Entrées",
        items: [
          { name: "Wagyu A5 Striploin", desc: "Marble score 12, charcoal grilled.", img: "https://images.pexels.com/photos/18945645/pexels-photo-18945645.jpeg?auto=compress&cs=tinysrgb&w=600" },
          { name: "Lobster Thermidor", desc: "Whole lobster in cheesy cream sauce.", img: "https://images.pexels.com/photos/8963459/pexels-photo-8963459.jpeg?auto=compress&cs=tinysrgb&w=600" }
        ]
      },
      {
        category: "Accompaniments",
        items: [
           { name: "Saffron Risotto", desc: "Milanese style creamy rice.", img: "https://images.pexels.com/photos/5639947/pexels-photo-5639947.jpeg?auto=compress&cs=tinysrgb&w=600" },
           { name: "Grilled Asparagus", desc: "With hollandaise sauce.", img: "https://images.pexels.com/photos/6107768/pexels-photo-6107768.jpeg?auto=compress&cs=tinysrgb&w=600" }
        ]
      },
      {
        category: "Finish",
        items: [
          { name: "Gold Leaf Opera Cake", desc: "Almond sponge and coffee.", img: "https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg?auto=compress&cs=tinysrgb&w=600" }
        ]
      },
      {
        category: "Beverages",
        items: [
            { name: "Champagne", desc: "Free flow Moët & Chandon.", img: "https://images.pexels.com/photos/290316/pexels-photo-290316.jpeg?auto=compress&cs=tinysrgb&w=600" },
            { name: "Signature Cocktails", desc: "Crafted by our mixologist.", img: "https://images.pexels.com/photos/1189257/pexels-photo-1189257.jpeg?auto=compress&cs=tinysrgb&w=600" }
        ]
      }
    ]
  }
];

const ClientProposal = () => {
  const { refId } = useParams();
  const navigate = useNavigate();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // --- VIEW STATE: SELECTION -> REVIEW -> SUCCESS ---
  const [viewMode, setViewMode] = useState("SELECTION"); 
  const [selectedPkgId, setSelectedPkgId] = useState(null);
  const [selectedAddOns, setSelectedAddOns] = useState([]);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');

  const detailsRef = useRef(null);
  // REF for HTML2PDF Capture
  const pdfRef = useRef(null); 

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      document.body.style.backgroundColor = '#0c0c0c';
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      document.body.style.backgroundColor = '#FAFAFA';
    }
  }, [darkMode]);

  useEffect(() => {
    const fetchProposal = async () => {
      try {
        const result = await getBookingByRefId(refId); 
        setData(result);
        if (result.status === "Proposal Accepted" || result.status === "For Approval") {
             // If already approved, show success by default (optional logic)
             // setViewMode("SUCCESS");
        }
      } catch (err) {
        // Fallback Data for demo
        setData({
          refId: refId || "BK-2025-001",
          fullName: "Guest Client",
          email: "guest@email.com",
          phone: "09123456789",
          date: "October 24, 2025",
          startTime: "18:00",
          eventType: "Corporate",
          venue: "Palacios Event Place",
          guests: 150
        });
      } finally {
        setLoading(false);
      }
    };
    fetchProposal();
  }, [refId]);

  const handleSelect = (pkgId) => {
    setSelectedPkgId(pkgId);
    setTimeout(() => {
        detailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const toggleAddOn = (addOnId) => {
    setSelectedAddOns(prev => 
      prev.includes(addOnId) ? prev.filter(id => id !== addOnId) : [...prev, addOnId]
    );
  };

  // --- PDF DOWNLOAD FUNCTION ---
  const handleDownloadPDF = () => {
      setIsDownloading(true);
      const element = pdfRef.current;
      const opt = {
        margin: [10, 10, 10, 10], // top, left, bottom, right (mm)
        filename: `Mapos_Proposal_${data?.refId || 'Draft'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      // Ensure promise settles to stop loading spinner
      html2pdf().set(opt).from(element).save()
        .then(() => setIsDownloading(false))
        .catch((err) => {
            console.error("PDF generation failed:", err);
            setIsDownloading(false);
        });
  };

  // --- Calculations ---
  const selectedPackage = PACKAGES.find(p => p.id === selectedPkgId);
  const guestCount = data?.guests || 100;
  
  const packageTotal = selectedPackage ? (selectedPackage.price * guestCount) : 0;
  const addOnsTotal = selectedAddOns.reduce((total, id) => {
    const item = ADD_ONS.find(a => a.id === id);
    if (!item) return total;
    return total + (item.type === 'per_head' ? item.price * guestCount : item.price);
  }, 0);
  
  const grandTotal = packageTotal + addOnsTotal;
  const transportFee = 1000;
  const serviceCharge = 0; // Configurable
  const totalAmount = grandTotal + transportFee + serviceCharge;
  const downpayment = totalAmount * 0.50;
  const remainingBalance = totalAmount - downpayment;

  const handleProceedToReview = () => {
      if (!selectedPkgId) return alert("Please select a package first.");
      setViewMode("REVIEW");
      window.scrollTo(0, 0);
  };

  const handleAcceptProposal = async () => {
    setIsConfirming(true);
    const payload = { refId, selectedPackageId: selectedPkgId, addOns: selectedAddOns, totalCost: totalAmount };
    try {
        await acceptProposal(payload);
        setViewMode("SUCCESS");
    } catch (error) {
        console.error("Error", error);
        setViewMode("SUCCESS"); // Allow UI success even if API fails for demo
    } finally {
        setIsConfirming(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 dark:bg-[#0c0c0c]">
        <Loader2 className="animate-spin text-[#C9A25D] mb-4" size={40} />
      </div>
    );
  }

  // Theme Classes
  const theme = {
    bg: darkMode ? 'bg-[#0c0c0c]' : 'bg-stone-50',
    cardBg: darkMode ? 'bg-[#1c1c1c]' : 'bg-white',
    text: darkMode ? 'text-stone-200' : 'text-stone-900',
    subText: darkMode ? 'text-stone-400' : 'text-stone-500',
    border: darkMode ? 'border-stone-800' : 'border-stone-200',
    headerBg: 'bg-[#111]',
    highlightRing: 'ring-[#C9A25D]',
    menuCardHover: darkMode ? 'hover:bg-stone-800' : 'hover:bg-stone-50'
  };

  // =========================================================
  // VIEW: SUCCESS (Accepted)
  // =========================================================
  if (viewMode === "SUCCESS") {
      return (
        <div className={`min-h-screen flex flex-col items-center justify-center text-center p-6 ${theme.bg}`}>
            <div className="w-24 h-24 bg-emerald-600 rounded-full flex items-center justify-center mb-8 shadow-xl animate-in zoom-in duration-500">
                <CheckCircle className="text-white w-12 h-12" />
            </div>
            <h1 className={`font-serif text-5xl md:text-6xl mb-6 ${theme.text}`}>Proposal Accepted</h1>
            <div className="w-16 h-[1px] bg-[#C9A25D] mb-6"></div>
            <p className={`text-lg md:text-xl max-w-lg mb-10 leading-relaxed ${theme.subText}`}>
                Thank you, <strong>{data.fullName}</strong>!<br/><br/>
                We have received your approval for the <strong>{selectedPackage?.name}</strong>.<br/>
                Our team will prepare the final contract and contact you shortly.
            </p>
            <button onClick={() => navigate('/')} className={`border-b-2 border-[#C9A25D] pb-1 text-sm uppercase tracking-widest ${theme.text}`}>Return Home</button>
        </div>
      );
  }

  // =========================================================
  // VIEW: REVIEW (Quotation Breakdown - With PDF Support)
  // =========================================================
  if (viewMode === "REVIEW") {
      return (
        <div className={`min-h-screen ${theme.bg} font-sans py-16 px-4 md:px-8`}>
            {/* 4. ATTACH THE REF TO THE CARD */}
            <div ref={pdfRef} className={`max-w-4xl mx-auto ${theme.cardBg} shadow-2xl border ${theme.border} rounded-sm overflow-hidden animate-in slide-in-from-bottom-5 duration-500`}>
                
                {/* 1. Header Area */}
                <div className="bg-[#111] p-10 text-center relative border-b border-[#C9A25D]">
                    <h2 className="text-[#C9A25D] text-3xl font-serif tracking-[0.2em] uppercase mb-2">Quotation Preview</h2>
                    <p className="text-stone-500 text-xs uppercase tracking-widest">Reference ID: {data.refId}</p>
                </div>

                <div className="p-10 space-y-12">
                    
                    {/* SECTION 1: Client & Event Information */}
                    <div className="border-b border-dashed border-stone-300 dark:border-stone-700 pb-8">
                        <h3 className={`text-sm uppercase tracking-widest font-bold mb-6 flex items-center gap-2 ${theme.text}`}><User size={16} /> 1. Client & Event Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-12">
                            <div className="space-y-1">
                                <p className={`text-[10px] uppercase text-stone-500`}>Name</p>
                                <p className={`font-serif text-lg ${theme.text}`}>{data.fullName}</p>
                            </div>
                            <div className="space-y-1">
                                <p className={`text-[10px] uppercase text-stone-500`}>Contact Info</p>
                                <p className={`font-medium text-sm ${theme.text}`}>{data.email}</p>
                                <p className={`font-medium text-sm ${theme.text}`}>{data.phone}</p>
                            </div>
                            <div className="space-y-1">
                                <p className={`text-[10px] uppercase text-stone-500`}>Event Details</p>
                                <p className={`font-medium text-sm ${theme.text}`}>{data.eventType} | {data.date}</p>
                                <p className={`font-medium text-sm ${theme.text}`}>{data.startTime}</p>
                            </div>
                            <div className="space-y-1">
                                <p className={`text-[10px] uppercase text-stone-500`}>Venue & Pax</p>
                                <p className={`font-medium text-sm ${theme.text}`}>{data.venue}</p>
                                <p className={`font-serif text-lg ${theme.text} text-[#C9A25D]`}>{guestCount} Guests</p>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: Selected Package */}
                    <div className="border-b border-dashed border-stone-300 dark:border-stone-700 pb-8">
                        <h3 className={`text-sm uppercase tracking-widest font-bold mb-6 flex items-center gap-2 ${theme.text}`}><Utensils size={16} /> 2. Selected Package</h3>
                        <div className={`p-6 border ${theme.border} rounded-sm mb-6 ${darkMode ? 'bg-white/5' : 'bg-stone-50'}`}>
                            <div className="flex justify-between items-start mb-4">
                                <h4 className={`font-serif text-2xl ${theme.text}`}>{selectedPackage.name}</h4>
                                <span className="font-mono font-bold text-lg text-[#C9A25D]">₱{selectedPackage.price} / head</span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Inclusions */}
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-stone-500 mb-3">Inclusions:</p>
                                    <ul className="space-y-2">
                                        {selectedPackage.features.map((feat, idx) => (
                                            <li key={idx} className={`flex items-start gap-2 text-sm ${theme.subText}`}><Check size={14} className="mt-1 text-green-500"/> {feat}</li>
                                        ))}
                                    </ul>
                                </div>
                                {/* Menu Options */}
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-stone-500 mb-3">Menu Options:</p>
                                    <ul className="space-y-2">
                                        {selectedPackage.menu.map((cat, idx) => (
                                            <li key={idx} className={`text-sm ${theme.subText}`}>
                                                <span className={`font-bold ${theme.text}`}>{cat.category}: </span>
                                                {cat.items.map(i => i.name).join(", ")}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 3: Add-ons */}
                    <div className="border-b border-dashed border-stone-300 dark:border-stone-700 pb-8">
                        <h3 className={`text-sm uppercase tracking-widest font-bold mb-6 flex items-center gap-2 ${theme.text}`}><Plus size={16} /> 3. Add-ons (Optional)</h3>
                        {selectedAddOns.length > 0 ? (
                            <div className="space-y-3 pl-2">
                                {selectedAddOns.map(id => {
                                    const item = ADD_ONS.find(a => a.id === id);
                                    return (
                                        <div key={id} className="flex justify-between text-sm items-center">
                                            <span className={theme.subText}>+ {item.name}</span>
                                            <span className={`font-mono font-bold ${theme.text}`}>₱ {item.price.toLocaleString()} {item.type === 'per_head' && `x ${guestCount} pax`}</span>
                                        </div>
                                    )
                                })}
                                <div className="border-t border-dashed border-stone-500 pt-3 mt-3 flex justify-between font-bold text-sm">
                                    <span className={theme.text}>Total Add-ons:</span>
                                    <span className={theme.text}>₱ {addOnsTotal.toLocaleString()}</span>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm italic text-stone-500 pl-4">No add-ons selected.</p>
                        )}
                    </div>

                    {/* SECTION 4: Price Breakdown */}
                    <div className="border-b border-dashed border-stone-300 dark:border-stone-700 pb-8">
                        <h3 className={`text-sm uppercase tracking-widest font-bold mb-6 flex items-center gap-2 ${theme.text}`}><FileText size={16} /> 4. Price Breakdown</h3>
                        <table className="w-full text-sm">
                            <thead className={`border-b ${theme.border} text-[10px] uppercase text-stone-500`}>
                                <tr>
                                    <th className="text-left py-2">Item</th>
                                    <th className="text-right py-2">Amount</th>
                                </tr>
                            </thead>
                            <tbody className={`${theme.text}`}>
                                <tr>
                                    <td className="py-3">Package (₱{selectedPackage.price} × {guestCount} pax)</td>
                                    <td className="text-right py-3">₱ {packageTotal.toLocaleString()}</td>
                                </tr>
                                <tr>
                                    <td className="py-3">Add-ons Total</td>
                                    <td className="text-right py-3">₱ {addOnsTotal.toLocaleString()}</td>
                                </tr>
                                <tr>
                                    <td className="py-3">Transportation Fee</td>
                                    <td className="text-right py-3">₱ {transportFee.toLocaleString()}</td>
                                </tr>
                                <tr className={theme.subText}>
                                    <td className="py-3">Service Charge (Optional)</td>
                                    <td className="text-right py-3">₱ {serviceCharge.toLocaleString()}</td>
                                </tr>
                                <tr className={`border-t-2 border-[#C9A25D] font-bold text-lg`}>
                                    <td className="py-4">TOTAL AMOUNT</td>
                                    <td className="text-right py-4 text-[#C9A25D]">₱ {totalAmount.toLocaleString()}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* SECTION 5: Payment Terms */}
                    <div className="border-b border-dashed border-stone-300 dark:border-stone-700 pb-8">
                        <h3 className={`text-sm uppercase tracking-widest font-bold mb-6 flex items-center gap-2 ${theme.text}`}><CheckCircle size={16} /> 5. Payment Terms</h3>
                        <div className={`p-5 border-l-4 border-[#C9A25D] ${darkMode ? 'bg-stone-800/30' : 'bg-amber-50'} text-sm space-y-3`}>
                            <div className="flex justify-between font-bold">
                                <span className={theme.text}>Required Downpayment (50% Reservation Fee):</span>
                                <span className={theme.text}>₱ {downpayment.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className={theme.subText}>Remaining Balance:</span>
                                <span className={theme.subText}>₱ {remainingBalance.toLocaleString()}</span>
                            </div>
                            <div className="text-xs text-stone-500 pt-2 space-y-1">
                                <p>• Balance Due: 5 days before the event.</p>
                                <p>• Mode of Payment: GCash, Bank Transfer, PayMongo.</p>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 6: Notes / Reminders */}
                    <div className="border-b border-dashed border-stone-300 dark:border-stone-700 pb-8">
                        <h3 className={`text-sm uppercase tracking-widest font-bold mb-6 flex items-center gap-2 ${theme.text}`}><Info size={16} /> 6. Notes / Reminders</h3>
                        <ul className={`list-disc pl-5 space-y-2 text-sm ${theme.subText}`}>
                            <li>Downpayment is required to lock the date.</li>
                            <li>Changes to menu or package are allowed up to 1 week before the event.</li>
                            <li>Balance must be settled strictly before the event date.</li>
                            <li>Cancelled events follow our cancellation policy (non-refundable reservation fee).</li>
                        </ul>
                    </div>

                    {/* SECTION 7: Client Actions - Excluded from PDF if using 'data-html2canvas-ignore' is too messy, here we keep it simpler by layout separation in CSS if needed, but html2pdf handles clean cuts nicely usually. To fully exclude it from PDF, users wrap it in a class and use html2pdf 'ignore' options, but default rendering usually wants full context. */}
                    <div data-html2canvas-ignore="true">
                        <h3 className={`text-sm uppercase tracking-widest font-bold mb-6 flex items-center gap-2 ${theme.text}`}><Check size={16} /> 7. Client Actions</h3>
                        
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Back */}
                            <button 
                                onClick={() => setViewMode("SELECTION")} 
                                className={`flex-1 py-4 border ${theme.border} text-stone-500 font-bold uppercase text-xs hover:bg-stone-100 dark:hover:bg-stone-800 rounded-sm transition-colors`}
                            >
                                Back / Edit Selection
                            </button>

                            {/* Download PDF - UPDATED */}
                            <button 
                                onClick={handleDownloadPDF} 
                                disabled={isDownloading}
                                className={`flex-1 py-4 border ${theme.border} ${theme.text} font-bold uppercase text-xs hover:bg-stone-100 dark:hover:bg-stone-800 rounded-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50`}
                            >
                                {isDownloading ? <Loader2 className="animate-spin" size={16} /> : <><Download size={16} /> Download PDF</>}
                            </button>

                            {/* Confirm */}
                            <button 
                                onClick={handleAcceptProposal} 
                                disabled={isConfirming}
                                className="flex-[2] py-4 bg-[#C9A25D] hover:bg-[#b08d55] text-white font-bold uppercase text-xs rounded-sm shadow-xl flex items-center justify-center gap-2 transition-all disabled:opacity-70"
                            >
                                {isConfirming ? <Loader2 className="animate-spin" /> : <><CheckCircle size={16} /> Approve & Submit Quotation</>}
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
      );
  }

  // =========================================================
  // VIEW: SELECTION (Default - Main Page)
  // =========================================================
  return (
    <div className={`min-h-screen ${theme.bg} font-sans pb-40 transition-colors duration-500`}>
        <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=Inter:wght@300;400;500&display=swap');
            .font-serif { font-family: 'Cormorant Garamond', serif; }
            .font-sans { font-family: 'Inter', sans-serif; }
        `}</style>

      {/* Nav */}
      <nav className={`fixed top-0 w-full z-40 px-6 py-4 flex justify-between items-center mix-blend-difference text-white`}>
         <div className="font-serif text-xl font-bold tracking-widest">CATERING<span className="text-[#C9A25D]">.</span></div>
         <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full hover:bg-white/10 transition-colors">
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
         </button>
      </nav>

      {/* Header */}
      <header className={`${theme.headerBg} text-white pt-32 pb-20 px-6 text-center relative overflow-hidden`}>
        <div className="relative z-10 max-w-4xl mx-auto">
          <span className="text-[#C9A25D] text-[10px] md:text-xs tracking-[0.3em] uppercase font-bold block mb-4">
            Ref: {data.refId}
          </span>
          <h1 className="font-serif text-4xl md:text-6xl text-white font-thin mb-6">
            Your Event <span className="italic">Proposal</span>
          </h1>
          <p className="text-stone-400 font-light max-w-xl mx-auto text-sm md:text-base leading-relaxed">
            We are honored to present these curated catering options for your event at <strong>{data.venue}</strong>. 
            Review the menus, select a package, and customize your experience.
          </p>

          <div className="flex flex-wrap justify-center gap-6 md:gap-12 mt-10 border-t border-stone-800 pt-8">
             <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-[#C9A25D]" />
                <div className="text-left">
                    <span className="block text-[10px] uppercase tracking-wider text-stone-500">Date</span>
                    <span className="text-sm font-medium">{data.date}</span>
                </div>
             </div>
             <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-[#C9A25D]" />
                <div className="text-left">
                    <span className="block text-[10px] uppercase tracking-wider text-stone-500">Guests</span>
                    <span className="text-sm font-medium">{guestCount} Pax</span>
                </div>
             </div>
          </div>
        </div>
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>
      </header>

      {/* Packages Grid */}
      <div className="max-w-7xl mx-auto px-6 -mt-10 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PACKAGES.map((pkg) => {
            const isSelected = selectedPkgId === pkg.id;
            return (
              <div 
                key={pkg.id}
                onClick={() => handleSelect(pkg.id)}
                className={`
                  relative flex flex-col p-8 rounded-sm cursor-pointer transition-all duration-300 group overflow-hidden
                  ${theme.cardBg}
                  ${isSelected 
                    ? `shadow-2xl ring-1 ${theme.highlightRing} -translate-y-2` 
                    : `shadow-lg border ${theme.border} hover:border-[#C9A25D]/50 hover:-translate-y-1`
                  }
                `}
              >
                {pkg.highlight && (
                    <div className="absolute top-0 right-0">
                        <div className="bg-[#C9A25D] text-white text-[9px] uppercase font-bold px-3 py-1 tracking-widest">Best Value</div>
                    </div>
                )}

                <div className="mb-6">
                    <h3 className={`font-serif text-3xl mb-2 ${theme.text}`}>{pkg.name}</h3>
                    <p className={`text-sm ${theme.subText} leading-relaxed`}>{pkg.description}</p>
                </div>

                <div className={`mb-8 pb-8 border-b ${theme.border}`}>
                    <div className="flex items-baseline gap-1">
                        <span className="text-sm text-stone-500">₱</span>
                        <span className={`text-4xl font-light ${theme.text}`}>{pkg.price.toLocaleString()}</span>
                        <span className="text-xs text-stone-500 uppercase tracking-wide">/ head</span>
                    </div>
                </div>

                <ul className="space-y-4 mb-8 flex-grow">
                    {pkg.features.map((feat, i) => (
                        <li key={i} className={`flex items-start gap-3 text-sm ${darkMode ? 'text-stone-400' : 'text-stone-600'}`}>
                            <Check className={`w-4 h-4 mt-0.5 ${isSelected ? 'text-[#C9A25D]' : 'text-stone-300'}`} />
                            <span className="font-light">{feat}</span>
                        </li>
                    ))}
                </ul>

                <div className={`
                    mt-auto w-full py-3 text-center text-xs uppercase tracking-[0.2em] font-bold border transition-colors duration-300
                    ${isSelected 
                        ? 'bg-[#C9A25D] text-white border-[#C9A25D]' 
                        : `${darkMode ? 'border-stone-700 text-stone-400' : 'border-stone-200 text-stone-400'} group-hover:border-[#C9A25D] group-hover:text-[#C9A25D]`
                    }
                `}>
                    {isSelected ? 'View Menu' : 'Select Package'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Visual Menu Grid (Restored) */}
      <div ref={detailsRef} className="max-w-6xl mx-auto px-6 mt-24 scroll-mt-24">
        {selectedPackage && (
           <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
              
              <div className="text-center mb-16">
                  <span className="text-[#C9A25D] text-[10px] uppercase tracking-[0.3em] font-bold block mb-4">Package Menu</span>
                  <h2 className={`font-serif text-4xl md:text-5xl ${theme.text} mb-4`}>{selectedPackage.name}</h2>
                  <div className="w-16 h-[1px] bg-[#C9A25D] mx-auto"></div>
                  <div className="mt-4 animate-bounce"><ChevronDown className="w-5 h-5 mx-auto text-stone-400" /></div>
              </div>

              <div className="space-y-20">
                  {selectedPackage.menu.map((category, idx) => (
                      <div key={idx}>
                          <div className="flex items-end gap-4 mb-8">
                              <h3 className={`font-serif text-3xl ${theme.text}`}>{category.category}</h3>
                              <div className={`flex-grow h-[1px] mb-2 opacity-20 ${darkMode ? 'bg-white' : 'bg-black'}`}></div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                              {category.items.map((item, i) => (
                                  <div key={i} className={`group flex flex-col rounded-md overflow-hidden transition-all duration-300 ${theme.menuCardHover}`}>
                                      <div className="relative aspect-[4/3] overflow-hidden bg-stone-200">
                                          <img 
                                            src={item.img} 
                                            alt={item.name} 
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                          />
                                          <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${darkMode ? 'bg-black/20' : 'bg-white/10'}`}></div>
                                      </div>
                                      <div className={`pt-4 pb-2 px-1`}>
                                          <h4 className={`font-serif text-xl ${theme.text} mb-1 group-hover:text-[#C9A25D] transition-colors`}>{item.name}</h4>
                                          <p className={`text-xs font-light leading-relaxed ${theme.subText}`}>{item.desc}</p>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>
                  ))}
              </div>

              {/* Add-ons Grid (Restored) */}
              <div className="mt-24 pt-16 border-t border-dashed border-stone-600">
                  <div className="text-center mb-12">
                      <span className="text-[#C9A25D] text-[10px] uppercase tracking-[0.3em] font-bold block mb-4">Enhance Your Event</span>
                      <h2 className={`font-serif text-4xl ${theme.text}`}>Premium Add-ons</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {ADD_ONS.map((addon) => {
                          const isActive = selectedAddOns.includes(addon.id);
                          return (
                            <div 
                                key={addon.id} 
                                onClick={() => toggleAddOn(addon.id)}
                                className={`relative flex flex-col rounded-lg overflow-hidden border cursor-pointer transition-all duration-300 
                                    ${isActive ? `border-[#C9A25D] ring-1 ring-[#C9A25D]` : `${theme.border} hover:border-stone-500`}
                                    ${theme.cardBg}
                                `}
                            >
                                <div className="h-40 bg-stone-200 overflow-hidden relative">
                                    <img src={addon.img} alt={addon.name} className="w-full h-full object-cover" />
                                    {isActive && <div className="absolute inset-0 bg-[#C9A25D]/20 flex items-center justify-center"><Check className="text-white w-10 h-10 drop-shadow-lg" /></div>}
                                </div>
                                <div className="p-6 flex flex-col flex-grow">
                                    <h4 className={`font-serif text-xl ${theme.text} mb-1`}>{addon.name}</h4>
                                    <p className={`text-sm ${theme.subText} mb-4`}>
                                        ₱ {addon.price.toLocaleString()} {addon.type === 'per_head' ? '/ head' : 'flat rate'}
                                    </p>
                                    <button className={`mt-auto w-full py-2 text-xs uppercase tracking-widest font-bold border rounded flex items-center justify-center gap-2 transition-colors ${isActive ? 'bg-[#C9A25D] text-white border-[#C9A25D]' : `${theme.text} border-stone-600`}`}>
                                        {isActive ? <><Check className="w-3 h-3" /> Added</> : <><Plus className="w-3 h-3" /> Add to Quote</>}
                                    </button>
                                </div>
                            </div>
                          );
                      })}
                  </div>
              </div>

           </div>
        )}
      </div>

      {/* Sticky Footer */}
      <div className={`
        fixed bottom-0 left-0 w-full border-t transition-transform duration-500 z-50
        ${darkMode ? 'bg-[#111] border-stone-800 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]' : 'bg-white border-stone-200 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]'}
        ${selectedPkgId ? 'translate-y-0' : 'translate-y-full'}
      `}>
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-6">
            
            <div className="flex items-center gap-6">
                <div className={`hidden md:flex w-12 h-12 rounded-full items-center justify-center text-[#C9A25D] ${darkMode ? 'bg-white/5' : 'bg-[#C9A25D]/10'}`}>
                    <Utensils className="w-5 h-5" />
                </div>
                <div>
                    <span className="text-[10px] uppercase tracking-widest text-stone-500 block mb-1">Quote Total ({selectedAddOns.length > 0 ? `+${selectedAddOns.length} Extras` : 'Base'})</span>
                    <h4 className={`font-serif text-2xl leading-none ${theme.text}`}>
                        {selectedPackage?.name}
                    </h4>
                </div>
            </div>

            <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
                <div className="text-right">
                    <span className="text-[10px] uppercase tracking-widest text-stone-500 block mb-1">Estimated Grand Total</span>
                    <span className="text-xl md:text-3xl font-light text-[#C9A25D]">
                        ₱ {grandTotal.toLocaleString()}
                    </span>
                </div>
                
                {/* Proceed Button */}
                <button 
                    onClick={handleProceedToReview}
                    className={`
                        px-8 py-4 text-xs tracking-[0.2em] uppercase font-bold transition-all duration-300 flex items-center gap-2
                        ${darkMode ? 'bg-stone-200 text-stone-900 hover:bg-[#C9A25D] hover:text-white' : 'bg-[#0c0c0c] text-white hover:bg-[#C9A25D]'}
                    `}
                >
                   Proceed to Review <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
      </div>

    </div>
  );
};

export default ClientProposal;
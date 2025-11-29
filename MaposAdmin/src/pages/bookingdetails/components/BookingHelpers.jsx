import React, { useState, useEffect, useRef } from 'react';
import { 
  CheckCircle, Clock, AlertCircle, AlertTriangle, User, 
  Utensils, Plus, FileText 
} from "lucide-react";

// --- DATA CONSTANTS ---
export const ADD_ONS = [
  { id: 'lechon', name: "Whole Roasted Lechon", price: 15000, type: 'fixed' },
  { id: 'mobile_bar', name: "Mobile Cocktail Bar (4 Hours)", price: 25000, type: 'fixed' },
  { id: 'grazing', name: "Grazing Table (Charcuterie)", price: 500, type: 'per_head' },
];

export const PACKAGES = [
  {
    id: 'classic',
    name: "Classic Buffet",
    price: 1200, 
    features: ["Full Buffet Setup", "Uniformed Waitstaff", "Basic Centerpieces", "4 Hours Service"],
    menu: [{ category: "Main Course", items: [{ name: "Roast Beef" }, { name: "Parmesan Fish" }] }]
  },
  {
    id: 'premium',
    name: "Premium Plated",
    price: 1800,
    features: ["Plated Service", "VIP Table Styling", "Coffee Station", "5 Hours Service"],
    menu: [{ category: "Main Course", items: [{ name: "Angus Ribeye" }, { name: "Salmon" }] }]
  },
  {
    id: 'signature',
    name: "Chef's Signature",
    price: 3500,
    features: ["7-Course Degustation", "Wine Pairing", "Full Butler Service"],
    menu: [{ category: "The Entrées", items: [{ name: "Wagyu A5" }, { name: "Lobster" }] }]
  }
];

export const REJECTION_REASONS = [
  "Date Unavailable / Fully Booked", "Budget Mismatch", "Location Out of Service Area",
  "Event Size Too Small", "Cannot Meet Specific Requirements", "Other"
];

// --- UI COMPONENTS ---

export const FadeIn = ({ children, delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      }, { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => { if (ref.current) observer.unobserve(ref.current); };
  }, []);

  return (
    <div ref={ref} className={`transition-all duration-700 ease-out transform ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
};

export const renderStatusBadge = (status) => {
  const styles = {
    Pending: "bg-amber-100 text-amber-700 border-amber-200",
    "For Approval": "bg-blue-100 text-blue-700 border-blue-200", 
    "Proposal Accepted": "bg-emerald-100 text-emerald-700 border-emerald-200",
    "Contract Sent": "bg-purple-100 text-purple-700 border-purple-200",
    Confirmed: "bg-emerald-100 text-emerald-700 border-emerald-200",
    Cancelled: "bg-red-100 text-red-700 border-red-200",
    Declined: "bg-red-100 text-red-700 border-red-200",
    Paid: "bg-emerald-100 text-emerald-700 border-emerald-200",
    Draft: "bg-stone-100 text-stone-500 border-stone-200",
  };
  
  return (
    <span className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold border ${styles[status] || styles.Draft}`}>
      {status}
    </span>
  );
};
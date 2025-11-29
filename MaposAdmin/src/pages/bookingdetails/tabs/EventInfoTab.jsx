import React from 'react';
import { Calendar, Clock, FileText, MapPin, Utensils } from "lucide-react";

const EventInfoTab = ({ details, theme }) => {
  return (
    <div className="max-w-4xl mx-auto">
      <h3 className={`font-serif text-2xl mb-6 ${theme.text}`}>Event Specifications</h3>
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 p-8 border ${theme.border} ${theme.cardBg} rounded-sm shadow-sm`}>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-stone-400 mb-1">Event Date</p>
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-[#C9A25D]" />
            <span className={`text-sm font-medium ${theme.text}`}>{details.date}</span>
          </div>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-stone-400 mb-1">Time & Duration</p>
          <div className="flex items-center gap-2">
            <Clock size={16} className="text-[#C9A25D]" />
            <span className={`text-sm font-medium ${theme.text}`}>{details.timeStart} — {details.timeEnd}</span>
          </div>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-stone-400 mb-1">Event Type</p>
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-[#C9A25D]" />
            <span className={`text-sm font-medium ${theme.text}`}>{details.type}</span>
          </div>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-stone-400 mb-1">Venue Location</p>
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-[#C9A25D]" />
            <span className={`text-sm font-medium ${theme.text}`}>{details.venue}</span>
          </div>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-stone-400 mb-1">Service Style</p>
          <div className="flex items-center gap-2">
            <Utensils size={16} className="text-[#C9A25D]" />
            <span className={`text-sm font-medium ${theme.text}`}>{details.serviceStyle}</span>
          </div>
        </div>
        <div className={`col-span-1 md:col-span-2 border-t border-dashed ${theme.border} my-2`}></div>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-stone-400 mb-1">Primary Contact</p>
          <p className={`text-sm font-medium ${theme.text}`}>{details.phone}</p>
          <p className={`text-xs ${theme.subText}`}>{details.email}</p>
        </div>
        <div className="col-span-1 md:col-span-2">
          <p className="text-[10px] uppercase tracking-widest text-stone-400 mb-2">Special Requests / Dietary Restrictions</p>
          <div className={`p-4 border ${theme.border} rounded-sm bg-transparent`}>
            <p className={`text-sm ${theme.text}`}>{details.dietary}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventInfoTab;
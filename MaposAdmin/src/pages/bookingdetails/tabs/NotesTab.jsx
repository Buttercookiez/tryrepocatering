import React from 'react';
import { User, MessageSquare, Send } from "lucide-react";

const NotesTab = ({ details, theme }) => {
  return (
    <div className="max-w-3xl mx-auto h-full flex flex-col">
      <div className="flex-1 relative space-y-8 before:absolute before:left-[19px] before:top-2 before:bottom-0 before:w-[1px] before:bg-stone-200 dark:before:bg-stone-800">
        {details.timeline.map((log, i) => (
          <div key={i} className="flex gap-6 relative">
            <div className={`w-10 h-10 rounded-full border ${theme.border} ${theme.cardBg} flex items-center justify-center z-10 shadow-sm`}>{log.user === "Admin" ? <User size={16} className="text-stone-400" /> : <MessageSquare size={16} className="text-[#C9A25D]" />}</div>
            <div className={`flex-1 p-4 border ${theme.border} ${theme.cardBg} rounded-sm`}><div className="flex justify-between items-start mb-1"><span className={`text-xs font-bold ${theme.text}`}>{log.user}</span><span className="text-[10px] text-stone-400 uppercase tracking-wide">{log.date}</span></div><p className={`text-sm ${theme.subText}`}>{log.action}</p></div>
          </div>
        ))}
      </div>
      <div className="mt-8 pt-6 border-t border-stone-100 dark:border-stone-800">
        <label className="text-[10px] uppercase tracking-widest text-stone-400 mb-2 block">Add Internal Note</label>
        <div className="flex gap-3">
          <textarea className={`flex-1 border ${theme.border} bg-transparent rounded-sm p-3 text-sm focus:outline-none focus:border-[#C9A25D]`} rows="3" placeholder="Type a private note for the admin team..."></textarea>
          <button className="self-end px-4 py-3 bg-[#1c1c1c] text-white hover:bg-[#C9A25D] transition-colors rounded-sm"><Send size={16} /></button>
        </div>
      </div>
    </div>
  );
};

export default NotesTab;
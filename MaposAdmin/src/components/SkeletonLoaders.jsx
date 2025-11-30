import React from "react";

// --- 1. BASE PRIMITIVE ---
// Updated: Now accepts 'style' prop so the Financial Charts can have dynamic heights.
const Skeleton = ({ className, variant = "rect", darkMode, style }) => {
  const colorClass = darkMode ? "bg-[#262626]" : "bg-stone-200";
  const radius = variant === "circle" ? "rounded-full" : "rounded-md";
  
  return (
    <div 
      className={`animate-pulse ${colorClass} ${radius} ${className}`} 
      style={{
        ...(darkMode ? { backgroundColor: "#262626" } : {}),
        ...style 
      }}
    />
  );
};

// --- 2. DYNAMIC BORDER HELPERS ---
// GUARANTEES borders are transparent in dark mode (No white outlines).
const getBorderClass = (isDark) => isDark ? "border border-transparent" : "border border-stone-200";
const getBorderBottom = (isDark) => isDark ? "border-b border-transparent" : "border-b border-stone-200";
const getBorderRight = (isDark) => isDark ? "border-r border-transparent" : "border-r border-stone-200";
const getBorderTop = (isDark) => isDark ? "border-t border-transparent" : "border-t border-stone-200";
const getDivideClass = (isDark) => isDark ? "divide-y divide-transparent" : "divide-y divide-stone-100";

// ==========================================
// 3. BOOKING SKELETONS
// ==========================================

export const BookingListSkeleton = ({ theme, darkMode }) => {
  return (
    <div className={`flex-1 overflow-y-auto p-6 md:p-12 ${theme.bg}`}>
      <div className="flex justify-between items-end mb-8">
        <div><Skeleton darkMode={darkMode} className="h-10 w-48 mb-3" /><Skeleton darkMode={darkMode} className="h-3 w-32" /></div>
        <div className="flex gap-3"><Skeleton darkMode={darkMode} className="h-10 w-24" /><Skeleton darkMode={darkMode} className="h-10 w-32" /></div>
      </div>
      <div className={`${getBorderClass(darkMode)} ${theme.cardBg} rounded-sm min-h-[400px]`}>
        <div className={`grid grid-cols-12 gap-4 px-8 py-5 ${getBorderBottom(darkMode)}`}>
           <Skeleton darkMode={darkMode} className="col-span-2 h-3 w-12" />
           <Skeleton darkMode={darkMode} className="col-span-3 h-3 w-16" />
           <Skeleton darkMode={darkMode} className="col-span-2 h-3 w-20" />
           <Skeleton darkMode={darkMode} className="col-span-2 h-3 w-12" />
           <Skeleton darkMode={darkMode} className="col-span-3 h-3 w-12 place-self-end" />
        </div>
        <div className={getDivideClass(darkMode)}>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="grid grid-cols-12 gap-4 px-8 py-6 items-center">
              <Skeleton darkMode={darkMode} className="col-span-2 h-3 w-14" />
              <div className="col-span-3"><Skeleton darkMode={darkMode} className="h-5 w-32 mb-2" /><Skeleton darkMode={darkMode} className="h-3 w-20" /></div>
              <Skeleton darkMode={darkMode} className="col-span-2 h-3 w-24" />
              <Skeleton darkMode={darkMode} className="col-span-2 h-6 w-20 rounded-sm" />
              <div className="col-span-3 flex justify-end gap-4"><Skeleton darkMode={darkMode} className="h-7 w-28 rounded-full" /><Skeleton darkMode={darkMode} className="h-4 w-4 rounded-full" /></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const BookingDetailsSkeleton = ({ theme, darkMode }) => {
  return (
    <div className={`flex-1 overflow-y-auto h-full flex flex-col ${theme.bg}`}>
      <div className={`h-16 flex items-center justify-between px-6 ${getBorderBottom(darkMode)} ${theme.cardBg}`}>
        <div className="flex gap-4"><Skeleton darkMode={darkMode} className="h-8 w-8 rounded-full" /><Skeleton darkMode={darkMode} className="h-5 w-40" /></div>
        <div className="flex gap-3"><Skeleton darkMode={darkMode} className="h-8 w-24 rounded-full" /></div>
      </div>
      <div className="flex flex-col lg:flex-row flex-1">
        <div className={`w-full lg:w-80 ${getBorderRight(darkMode)} ${theme.cardBg} p-8 space-y-8`}>
           <div className="flex flex-col items-center"><Skeleton darkMode={darkMode} className="w-20 h-20 rounded-full mb-4" /><Skeleton darkMode={darkMode} className="w-40 h-6" /></div>
           <div className="space-y-6">{[1, 2, 3].map(i => <div key={i} className="flex gap-3"><Skeleton darkMode={darkMode} className="w-4 h-4" /><Skeleton darkMode={darkMode} className="w-32 h-3" /></div>)}</div>
        </div>
        <div className="flex-1 p-12 space-y-8">
           <div className="grid grid-cols-2 gap-8"><Skeleton darkMode={darkMode} className="h-16 w-full" /><Skeleton darkMode={darkMode} className="h-16 w-full" /></div>
           <Skeleton darkMode={darkMode} className="h-64 w-full" />
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 4. GENERIC SKELETONS
// ==========================================

export const GridSkeleton = ({ theme, darkMode, count = 6 }) => {
  return (
    <div className={`flex-1 overflow-y-auto px-6 pb-12 ${theme.bg}`}>
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className={`p-6 ${getBorderClass(darkMode)} ${theme.cardBg} rounded-sm space-y-4 h-80`}>
             <Skeleton darkMode={darkMode} className="w-full h-40 rounded-sm" />
             <div className="space-y-2"><Skeleton darkMode={darkMode} className="h-5 w-3/4" /><Skeleton darkMode={darkMode} className="h-3 w-1/2" /></div>
             <div className={`pt-4 ${getBorderTop(darkMode)} flex justify-between`}><Skeleton darkMode={darkMode} className="h-4 w-16" /><Skeleton darkMode={darkMode} className="h-6 w-6 rounded-full" /></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const TableSkeleton = ({ theme, darkMode, rows = 8 }) => {
  return (
    <div className={`flex-1 overflow-y-auto px-6 pb-12 ${theme.bg}`}>
      <div className={`${getBorderClass(darkMode)} ${theme.cardBg} rounded-sm mt-8`}>
        <div className={`flex gap-4 px-8 py-5 ${getBorderBottom(darkMode)}`}>{[1,2,3,4,5].map(i=><Skeleton key={i} darkMode={darkMode} className="h-3 w-full"/>)}</div>
        <div className={getDivideClass(darkMode)}>
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex gap-4 px-8 py-6"><Skeleton darkMode={darkMode} className="h-4 w-12" /><Skeleton darkMode={darkMode} className="h-4 w-full" /><Skeleton darkMode={darkMode} className="h-4 w-20" /></div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 5. UNIQUE PAGE SKELETONS
// ==========================================

// --- DASHBOARD ---
export const DashboardSkeleton = ({ theme, darkMode }) => {
  return (
    <div className={`flex-1 overflow-y-auto p-8 md:p-12 ${theme.bg}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[1, 2, 3, 4].map((i) => (<div key={i} className={`p-8 ${getBorderClass(darkMode)} ${theme.cardBg} h-40 flex flex-col justify-between`}><div className="flex justify-between"><Skeleton darkMode={darkMode} className="h-3 w-24" /><Skeleton darkMode={darkMode} className="h-4 w-4" /></div><div><Skeleton darkMode={darkMode} className="h-10 w-32 mb-2" /><Skeleton darkMode={darkMode} className="h-3 w-16" /></div></div>))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
         <div className={`lg:col-span-2 ${getBorderClass(darkMode)} p-8 h-96`}><div className="flex justify-between mb-8"><Skeleton darkMode={darkMode} className="h-8 w-48" /><Skeleton darkMode={darkMode} className="h-3 w-24" /></div><div className="space-y-4">{[1, 2, 3, 4].map(i => (<div key={i} className="flex justify-between items-center py-2"><div className="flex gap-4"><Skeleton darkMode={darkMode} className="h-12 w-12 rounded-sm" /><div><Skeleton darkMode={darkMode} className="h-4 w-40 mb-2" /><Skeleton darkMode={darkMode} className="h-3 w-24" /></div></div><Skeleton darkMode={darkMode} className="h-6 w-20 rounded-full" /></div>))}</div></div>
         <div className={`lg:col-span-1 ${getBorderClass(darkMode)} p-8 h-96`}><div className="flex justify-between mb-8"><Skeleton darkMode={darkMode} className="h-8 w-40" /><Skeleton darkMode={darkMode} className="h-5 w-5 rounded-full" /></div><div className="space-y-6">{[1, 2, 3].map(i => (<div key={i}><div className="flex justify-between mb-2"><Skeleton darkMode={darkMode} className="h-3 w-20" /><Skeleton darkMode={darkMode} className="h-3 w-8" /></div><Skeleton darkMode={darkMode} className="h-2 w-full rounded-full" /></div>))}</div></div>
      </div>
      <div className={`${getBorderClass(darkMode)} ${theme.cardBg} p-8 h-80 flex flex-col`}>
          <div className="flex justify-between mb-8"><Skeleton darkMode={darkMode} className="h-8 w-48" /><div className="flex gap-4"><Skeleton darkMode={darkMode} className="h-3 w-16" /><Skeleton darkMode={darkMode} className="h-3 w-16" /></div></div>
          {/* FIX: Passed style prop to Skeleton for dynamic height */}
          <div className="flex items-end justify-between h-full gap-4">{[1, 2, 3, 4, 5, 6, 7].map(i => (<Skeleton key={i} darkMode={darkMode} className={`w-full rounded-t-sm`} style={{ height: `${Math.random() * 60 + 20}%`}} />))}</div>
      </div>
    </div>
  );
};

// --- KITCHEN ---
export const KitchenSkeleton = ({ theme, darkMode }) => {
  return (
    <div className={`flex-1 overflow-y-auto px-6 md:px-12 pt-8 ${theme.bg}`}>
       <div className="flex justify-between items-end mb-8"><div><Skeleton darkMode={darkMode} className="h-8 w-48 mb-2" /><Skeleton darkMode={darkMode} className="h-3 w-64" /></div><div className="flex gap-4"><Skeleton darkMode={darkMode} className="h-9 w-32" /><Skeleton darkMode={darkMode} className="h-9 w-40" /></div></div>
       <div className={`${getBorderClass(darkMode)} ${theme.cardBg} rounded-sm`}><div className={`grid grid-cols-12 gap-6 px-8 py-4 ${getBorderBottom(darkMode)}`}><Skeleton darkMode={darkMode} className="col-span-4 h-3 w-24" /><Skeleton darkMode={darkMode} className="col-span-5 h-3 w-24" /><Skeleton darkMode={darkMode} className="col-span-3 h-3 w-12 place-self-end" /></div><div className={getDivideClass(darkMode)}>{[1, 2, 3, 4, 5, 6].map(i => (<div key={i} className="grid grid-cols-12 gap-6 px-8 py-6 items-center"><div className="col-span-4"><Skeleton darkMode={darkMode} className="h-5 w-40 mb-2" /><Skeleton darkMode={darkMode} className="h-3 w-16" /></div><div className="col-span-5"><div className="flex justify-between mb-2"><Skeleton darkMode={darkMode} className="h-2 w-12" /><Skeleton darkMode={darkMode} className="h-2 w-8" /></div><Skeleton darkMode={darkMode} className="h-2 w-full rounded-full" /></div><div className="col-span-3 flex justify-end gap-3"><Skeleton darkMode={darkMode} className="h-8 w-8 rounded-sm" /><Skeleton darkMode={darkMode} className="h-8 w-12" /><Skeleton darkMode={darkMode} className="h-8 w-8 rounded-sm" /></div></div>))}</div></div>
    </div>
  );
};

// --- INVENTORY ---
export const InventorySkeleton = ({ theme, darkMode }) => {
  return (
    <div className={`flex-1 overflow-y-auto p-6 md:p-12 ${theme.bg}`}>
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">{[1, 2, 3].map(i => (<div key={i} className={`p-6 ${getBorderClass(darkMode)} ${theme.cardBg} flex justify-between h-32`}><div className="flex flex-col justify-between"><Skeleton darkMode={darkMode} className="h-3 w-24" /><Skeleton darkMode={darkMode} className="h-8 w-16" /><Skeleton darkMode={darkMode} className="h-3 w-32" /></div><Skeleton darkMode={darkMode} className="h-10 w-10 rounded-full" /></div>))}</div>
       <div className={`${getBorderClass(darkMode)} ${theme.cardBg} min-h-[500px]`}><div className={`p-6 ${getBorderBottom(darkMode)} flex justify-between`}><Skeleton darkMode={darkMode} className="h-8 w-40" /><div className="flex gap-2"><Skeleton darkMode={darkMode} className="h-8 w-64" /><Skeleton darkMode={darkMode} className="h-8 w-24" /></div></div><div className="p-0">{[1, 2, 3, 4, 5, 6].map(i => (<div key={i} className={`grid grid-cols-12 gap-4 px-8 py-6 ${getBorderBottom(darkMode)} items-center`}><div className="col-span-3"><Skeleton darkMode={darkMode} className="h-5 w-32 mb-1" /><Skeleton darkMode={darkMode} className="h-3 w-16" /></div><Skeleton darkMode={darkMode} className="col-span-2 h-3 w-20" /><Skeleton darkMode={darkMode} className="col-span-2 h-6 w-24 rounded-sm" /><div className="col-span-3"><Skeleton darkMode={darkMode} className="h-2 w-full rounded-full" /></div><div className="col-span-2 flex justify-end"><Skeleton darkMode={darkMode} className="h-6 w-20 rounded-sm" /></div></div>))}</div></div>
    </div>
  );
};

// --- CLIENT RECORDS ---
export const ClientSkeleton = ({ theme, darkMode }) => {
  return (
    <div className={`flex-1 overflow-y-auto p-6 md:p-12 ${theme.bg}`}>
       <div className="flex justify-between items-end mb-8"><div><Skeleton darkMode={darkMode} className="h-8 w-48 mb-2" /><Skeleton darkMode={darkMode} className="h-3 w-32" /></div><div className="flex gap-3"><Skeleton darkMode={darkMode} className="h-9 w-24" /><Skeleton darkMode={darkMode} className="h-9 w-32 bg-stone-300 dark:bg-stone-700" /></div></div>
       <div className={`${getBorderClass(darkMode)} ${theme.cardBg} rounded-sm`}><div className={`grid grid-cols-12 gap-4 px-8 py-5 ${getBorderBottom(darkMode)}`}><Skeleton darkMode={darkMode} className="col-span-3 h-3 w-24" /><Skeleton darkMode={darkMode} className="col-span-3 h-3 w-20" /><Skeleton darkMode={darkMode} className="col-span-2 h-3 w-20" /><Skeleton darkMode={darkMode} className="col-span-2 h-3 w-20 place-self-end" /><Skeleton darkMode={darkMode} className="col-span-2 h-3 w-12 place-self-end" /></div><div className={getDivideClass(darkMode)}>{[1, 2, 3, 4, 5, 6, 7].map(i => (<div key={i} className="grid grid-cols-12 gap-4 px-8 py-6 items-center"><div className="col-span-3"><Skeleton darkMode={darkMode} className="h-5 w-40 mb-1" /><Skeleton darkMode={darkMode} className="h-3 w-24" /></div><Skeleton darkMode={darkMode} className="col-span-3 h-3 w-32" /><Skeleton darkMode={darkMode} className="col-span-2 h-3 w-20" /><Skeleton darkMode={darkMode} className="col-span-2 h-6 w-24 place-self-end" /><div className="col-span-2 flex justify-end gap-4"><Skeleton darkMode={darkMode} className="h-4 w-4" /><Skeleton darkMode={darkMode} className="h-4 w-4" /></div></div>))}</div></div>
    </div>
  );
};

// --- CALENDAR ---
export const CalendarSkeleton = ({ theme, darkMode }) => {
  return (
    <div className={`flex-1 overflow-y-auto p-6 md:p-8 ${theme.bg}`}>
       <div className="flex flex-col lg:flex-row gap-8 h-full"><div className="flex-1 flex flex-col"><div className="flex justify-between items-end mb-6"><div><Skeleton darkMode={darkMode} className="h-3 w-20 mb-2" /><Skeleton darkMode={darkMode} className="h-8 w-48" /></div><div className="flex gap-2"><Skeleton darkMode={darkMode} className="h-9 w-20" /><Skeleton darkMode={darkMode} className="h-9 w-32" /></div></div><div className={`${getBorderClass(darkMode)} ${theme.cardBg} h-[600px] grid grid-cols-7`}>{[...Array(7)].map((_, i) => (<div key={`h-${i}`} className={`border-b ${getBorderRight(darkMode)} h-10 flex items-center justify-center`}><Skeleton darkMode={darkMode} className="h-2 w-8" /></div>))}_{[...Array(35)].map((_, i) => (<div key={`d-${i}`} className={`border-b ${getBorderRight(darkMode)} p-2`}><Skeleton darkMode={darkMode} className="h-4 w-4 rounded-full mb-4" />{i % 5 === 0 && <Skeleton darkMode={darkMode} className="h-3 w-full rounded-sm" />}</div>))}</div></div><div className={`w-full lg:w-80 h-full ${getBorderClass(darkMode)} p-6`}><Skeleton darkMode={darkMode} className="h-3 w-24 mb-2" /><Skeleton darkMode={darkMode} className="h-8 w-40 mb-8" /><div className="space-y-4">{[1, 2, 3].map(i => (<div key={i} className={`p-4 ${getBorderClass(darkMode)} h-32 flex flex-col justify-between`}><div className="flex justify-between"><Skeleton darkMode={darkMode} className="h-4 w-16 rounded-full" /><Skeleton darkMode={darkMode} className="h-4 w-4" /></div><Skeleton darkMode={darkMode} className="h-5 w-40" /><div className="space-y-1"><Skeleton darkMode={darkMode} className="h-3 w-24" /><Skeleton darkMode={darkMode} className="h-3 w-20" /></div></div>))}</div></div></div>
    </div>
  );
};

// --- FINANCIALS ---
export const FinanceSkeleton = ({ theme, darkMode }) => {
  return (
    <div className={`flex-1 overflow-y-auto p-6 md:p-12 ${theme.bg}`}>
       <div className="flex justify-between items-end mb-8"><div><Skeleton darkMode={darkMode} className="h-8 w-48 mb-2" /><Skeleton darkMode={darkMode} className="h-3 w-64" /></div><div className="flex gap-3"><Skeleton darkMode={darkMode} className="h-9 w-32" /><Skeleton darkMode={darkMode} className="h-9 w-40" /></div></div>
       <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">{[1, 2, 3, 4].map(i => (<div key={i} className={`p-6 ${getBorderClass(darkMode)} ${theme.cardBg} h-32 flex flex-col justify-between`}><div className="flex justify-between"><Skeleton darkMode={darkMode} className="h-3 w-24" /><Skeleton darkMode={darkMode} className="h-4 w-4" /></div><div className="flex justify-between items-end"><Skeleton darkMode={darkMode} className="h-8 w-32" /><Skeleton darkMode={darkMode} className="h-3 w-12" /></div></div>))}</div>
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* FIX: Added style prop to children so charts show up */}
          <div className={`lg:col-span-2 ${getBorderClass(darkMode)} p-8 h-80 flex items-end gap-4`}>
             {[...Array(8)].map((_, i) => (<div key={i} className="flex-1 flex gap-1 items-end h-full">
                <Skeleton darkMode={darkMode} className="w-full rounded-t-sm" style={{ height: `${Math.random() * 50 + 20}%`}} />
                <Skeleton darkMode={darkMode} className="w-full rounded-t-sm" style={{ height: `${Math.random() * 50 + 20}%`}} />
             </div>))}
          </div>
          <div className={`lg:col-span-1 ${getBorderClass(darkMode)} p-8 h-80`}><Skeleton darkMode={darkMode} className="h-6 w-32 mb-6" /><div className="space-y-6">{[1, 2, 3].map(i => (<div key={i}><div className="flex justify-between mb-2"><Skeleton darkMode={darkMode} className="h-3 w-20" /><Skeleton darkMode={darkMode} className="h-3 w-16" /></div><Skeleton darkMode={darkMode} className="h-2 w-full rounded-full" /></div>))}</div></div>
       </div>
       <div className={`${getBorderClass(darkMode)} ${theme.cardBg} h-64`}><div className={`p-6 ${getBorderBottom(darkMode)} flex justify-between`}><Skeleton darkMode={darkMode} className="h-6 w-40" /><Skeleton darkMode={darkMode} className="h-4 w-20" /></div><div className="space-y-6 p-6">{[1, 2, 3].map(i => (<div key={i} className="flex justify-between"><div className="flex gap-4"><Skeleton darkMode={darkMode} className="h-4 w-16" /><Skeleton darkMode={darkMode} className="h-4 w-48" /></div><Skeleton darkMode={darkMode} className="h-4 w-24" /></div>))}</div></div>
    </div>
  );
};
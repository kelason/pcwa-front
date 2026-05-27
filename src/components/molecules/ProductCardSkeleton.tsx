import React from 'react';

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-2 shadow-sm animate-pulse flex flex-col h-full">
      <div className="border border-[#4E878C] rounded-xl bg-[#4E878C]/5 p-4 mb-4">
        <div className="flex justify-between items-center mb-2">
          {/* Title Placeholder */}
          <div className="h-6 bg-[#4E878C] rounded-lg w-3/4"></div>
          
          {/* Tag Placeholder */}
          <div className="h-6 bg-[#4E878C] rounded-full w-24"></div>
        </div>
      
      {/* Price Placeholder */}
        <div className="h-5 bg-[#4E878C] rounded-lg w-1/4 mb-4"></div>
      </div>
      
      {/* Footer Actions Placeholder */}
      <div className="mt-auto flex gap-4 pt-4 border-t border-slate-50">
        <div className="h-9 bg-slate-100 rounded-lg w-10"></div>
        <div className="h-9 bg-slate-100 rounded-lg w-10"></div>
      </div>
    </div>
  );
};
import React from 'react';

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm animate-pulse flex flex-col h-full">
      {/* Title Placeholder */}
      <div className="h-6 bg-slate-200 rounded-md w-3/4 mb-3"></div>
      
      {/* Price Placeholder */}
      <div className="h-5 bg-slate-100 rounded-md w-1/4 mb-5"></div>
      
      {/* Tag Placeholder */}
      <div className="mb-8">
        <div className="h-6 bg-slate-100 rounded-full w-24"></div>
      </div>
      
      {/* Footer Actions Placeholder */}
      <div className="mt-auto flex gap-4 pt-4 border-t border-slate-50">
        <div className="h-9 bg-slate-100 rounded-lg w-10"></div>
        <div className="h-9 bg-slate-100 rounded-lg w-10"></div>
      </div>
    </div>
  );
};
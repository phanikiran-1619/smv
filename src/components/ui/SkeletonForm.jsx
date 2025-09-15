import React from 'react';
import { Skeleton } from './skeleton';

const SkeletonForm = () => {
  return (
    <div className="space-y-6 bg-slate-800/80 dark:bg-slate-800/80 bg-white/80 border-yellow-400 border-2 p-8 rounded-2xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Generate 8 skeleton input fields */}
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-4 w-24 dark:bg-slate-600 bg-gray-300" />
            <Skeleton className="h-9 w-full dark:bg-slate-700 bg-gray-200" />
          </div>
        ))}
      </div>
      
      {/* Skeleton buttons */}
      <div className="mt-8 flex flex-col sm:flex-row gap-4">
        <Skeleton className="flex-1 h-12 dark:bg-slate-600 bg-gray-300" />
        <Skeleton className="flex-1 h-12 dark:bg-slate-600 bg-gray-300" />
        <Skeleton className="flex-1 h-12 dark:bg-slate-600 bg-gray-300" />
      </div>
    </div>
  );
};

export default SkeletonForm;
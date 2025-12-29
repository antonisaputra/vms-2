import React from 'react';
import { CheckCircleIcon } from './icons';

const SuccessLottie: React.FC = () => {
  // Reverted to static SVG to fix build issues and focus on backend integration.
  return (
    <div className="flex justify-center items-center" style={{ width: '120px', height: '120px', margin: '0 auto' }}>
       <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-full">
         <CheckCircleIcon className="w-16 h-16 text-green-600 dark:text-green-400" />
       </div>
    </div>
  );
};

export default SuccessLottie;

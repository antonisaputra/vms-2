

import React, { useEffect, useRef } from 'react';
import { SmartToast } from '../types';
import { gsap } from 'gsap';

interface ToastNotificationProps {
  toast: SmartToast | null;
}

const ToastNotification: React.FC<ToastNotificationProps> = ({ toast }) => {
  const toastRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (toast && toastRef.current) {
      gsap.fromTo(
        toastRef.current,
        { y: -20, opacity: 0, x: '5%' },
        { y: 0, opacity: 1, x: '0%', duration: 0.5, ease: 'back.out(1.7)' }
      );
    }
  }, [toast]);

  if (!toast) {
    return null;
  }

  return (
    <div
      ref={toastRef}
      className="fixed top-6 right-6 z-[100] w-full max-w-sm bg-white dark:bg-gray-800 shadow-2xl rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5"
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <img 
                className="h-12 w-12 rounded-md object-cover" 
                src={toast.imageUrl} 
                alt="Foto Tamu" 
            />
          </div>
          <div className="ml-4 w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{toast.title}</p>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{toast.message}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToastNotification;
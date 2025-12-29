
import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { CloseIcon } from './icons';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  showCloseButton?: boolean;
  maxWidth?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, showCloseButton = true, maxWidth = 'max-w-2xl' }) => {
  const backgroundRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      gsap.to(backgroundRef.current, { opacity: 1, duration: 0.3 });
      gsap.fromTo(
        modalRef.current,
        { opacity: 0, scale: 0.95, y: 20 },
        { opacity: 1, scale: 1, y: 0, duration: 0.3, ease: 'power3.out' }
      );
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isOpen]);

  const handleClose = () => {
    gsap.to(modalRef.current, {
      opacity: 0,
      scale: 0.95,
      y: 20,
      duration: 0.2,
      ease: 'power3.in',
      onComplete: onClose,
    });
    gsap.to(backgroundRef.current, { opacity: 0, duration: 0.2 });
  };
  
  if (!isOpen) return null;

  return (
    <div
      ref={backgroundRef}
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 opacity-0"
      onClick={handleClose}
    >
      <div
        ref={modalRef}
        className={`bg-white rounded-lg shadow-xl w-full ${maxWidth} transform transition-all relative`}
        onClick={(e) => e.stopPropagation()}
      >
        {showCloseButton && (
          <button onClick={handleClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 z-10">
            <CloseIcon className="w-6 h-6" />
          </button>
        )}
        {children}
      </div>
    </div>
  );
};

export default Modal;

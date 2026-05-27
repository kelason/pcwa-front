import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, maxWidth = 'max-w-md' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <style>{`
        @keyframes modalEnter {
          from { opacity: 0.5; transform: scale(0.50) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-modal-enter {
          animation: modalEnter 0.2s ease-out forwards;
        }
      `}</style>
      <div 
        className={`bg-white rounded-lg shadow-xl ${maxWidth} w-full p-6 animate-modal-enter`}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-6">{title}</h2>
        {children}
      </div>
    </div>
  );
};
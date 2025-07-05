'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  modalWidth?: number;
  modalHeight?: number;
  className?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  modalWidth = 400,
  modalHeight,
  className = '',
}) => {
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isOpen && target?.id === 'custom-modal') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [isOpen, onClose]);

  return (
    <div
      id="custom-modal"
      className={`fixed inset-0 z-50 bg-[#0808088c] bg-opacity-50 flex items-center justify-center ${
        isOpen ? 'block' : 'hidden'
      }`}
    >
      <div
        className={`relative bg-white rounded-lg shadow-lg p-6 ${className}`}
        style={{
          width: modalWidth,
          height: modalHeight,
        }}
      >
        <span
          onClick={onClose}
          className="absolute top-3 right-3 p-1 hover:bg-gray-100 rounded-full focus:outline-none"
          aria-label="Close Modal"
        >
          <X className="w-5 h-5 text-gray-600" />
        </span>

        {children}
      </div>
    </div>
  );
};

export default Modal;

// src/components/ui/Modal.tsx
/**
 * A reusable modal dialog component.
 * Uses fixed positioning and a backdrop for overlay effect.
 * Content is passed via children. Includes a title and close button.
 * Supports basic glassmorphism styling via Tailwind classes.
 */
import React, { ReactNode, MouseEvent } from 'react';
import { X } from 'lucide-react';
import Button from './Button'; // Assuming Button component exists

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  // Optional props for size, custom classes, etc. can be added
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) {
    return null; // Don't render anything if not open
  }

  // Prevent closing when clicking inside the modal content
  const handleContentClick = (e: MouseEvent) => {
    e.stopPropagation();
  };

  return (
    // Backdrop (fixed position, covers screen, handles close on click)
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-filter backdrop-blur-sm transition-opacity duration-150"
      onClick={onClose} // Close when clicking backdrop
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Modal Panel (centered, stops click propagation) */}
      <div
        className="bg-bg-secondary bg-opacity-80 dark:bg-opacity-70 backdrop-filter backdrop-blur-lg rounded-lg shadow-xl w-full max-w-md m-4 border border-border border-opacity-30 overflow-hidden"
        onClick={handleContentClick} // Don't close when clicking panel
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 id="modal-title" className="text-lg font-semibold">
            {title}
          </h2>
          <Button
             variant="ghost" size="sm" icon={X} onClick={onClose} title="Close Modal" className="p-1"
          />
        </div>

        {/* Modal Body (content passed as children) */}
        <div className="p-4 max-h-[70vh] overflow-y-auto">
             {children}
        </div>

         {/* Optional Footer (can be added via children or props) */}
         {/* <div className="flex justify-end p-4 border-t border-border"> ...buttons... </div> */}
      </div>
    </div>
  );
};

export default Modal;
import React from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div
                className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md border border-gray-700"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
            >
                {title && (
                    <h2 className="text-lg font-semibold text-text-main mb-4 border-b border-gray-700 pb-2">
                        {title}
                    </h2>
                )}
                <div>{children}</div>
                <div className="mt-6 flex justify-end">
                    <button onClick={onClose} className="btn btn-secondary">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};
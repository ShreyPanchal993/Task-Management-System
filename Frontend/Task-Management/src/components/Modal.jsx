import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { LuX } from 'react-icons/lu'

const Modal = ({ children, isOpen, onClose, title }) => {
    // Lock body scroll and listen for Escape key when modal is open
    useEffect(() => {
        if (!isOpen) return;

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose?.();
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = originalOverflow;
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-[100] flex justify-center items-center p-4 overflow-y-auto overflow-x-hidden animate-fade-in"
            style={{
                background: "rgba(30, 41, 59, 0.16)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
            }}
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose?.();
            }}
            role="dialog"
            aria-modal="true"
        >
            <div className="relative w-full max-w-xl max-h-[90vh] flex flex-col animate-scale-in">
                <div
                    className="relative rounded-[28px] border shadow-[0_24px_60px_rgba(15,23,42,0.16)] flex flex-col max-h-[90vh] overflow-hidden"
                    style={{
                        background: "var(--modal-bg)",
                        borderColor: "var(--border-soft)",
                    }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b soft-divider shrink-0">
                        <h3 className="text-base sm:text-lg font-semibold text-slate-800 dark:text-slate-100 tracking-tight">
                            {title}
                        </h3>

                        <button
                            type="button"
                            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition cursor-pointer"
                            onClick={onClose}
                            aria-label="Close"
                        >
                            <LuX className="text-lg" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="p-5 sm:p-6 overflow-y-auto custom-scrollbar flex-1">
                        {children}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default Modal


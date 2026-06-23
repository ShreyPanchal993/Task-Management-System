import React from 'react'

const Modal = ({ children, isOpen, onClose, title }) => {
    if (!isOpen) return;

    return (
        <div className="fixed inset-0 z-50 flex justify-center items-center w-full overflow-y-auto overflow-x-hidden bg-slate-950/25 backdrop-blur-sm p-4">
            <div className="relative p-4 w-full max-w-2xl max-h-full">
                <div className="relative rounded-[28px] border shadow-2xl" style={{ background: "linear-gradient(180deg, rgba(255, 253, 248, 0.96) 0%, rgba(255, 255, 255, 0.84) 100%)", borderColor: "var(--border-soft)" }}>
                    <div className="flex items-center justify-between p-4 md:p-5 border-b soft-divider">
                        <h3 className="text-lg font-medium text-gray-900">
                            {title}
                        </h3>

                        <button 
                            type="button"
                            className="text-gray-400 bg-transparent hover:bg-white hover:text-gray-900 rounded-full text-sm w-8 h-8 inline-flex justify-center items-center cursor-pointer"
                            onClick={onClose}
                        >
                            <svg
                                className="w-3 h-3"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 14 14"
                            >
                                <path
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                                />
                            </svg>
                        </button>
                    </div>

                    <div className="p-4 md:p-5 space-y-4">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Modal

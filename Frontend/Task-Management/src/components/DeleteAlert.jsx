import React from 'react'

const DeleteAlert = ({ content, onDelete }) => {
    return (
        <div>
            <p className="text-sm text-slate-600 dark:text-slate-300">{content}</p>

            <div className="flex justify-end mt-6">
                <button
                    type="button"
                    className="flex items-center justify-center gap-1.5 text-xs md:text-sm font-semibold text-rose-700 dark:text-rose-300 whitespace-nowrap bg-rose-100/80 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-full px-4 py-2 hover:bg-rose-200 dark:hover:bg-rose-900/80 transition-colors cursor-pointer"
                    onClick={onDelete}
                >
                    Delete
                </button>
            </div>
        </div>
    )
}

export default DeleteAlert

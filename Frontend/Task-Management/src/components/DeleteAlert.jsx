import React from 'react'

const DeleteAlert = ({ content, onDelete }) => {
    return (
        <div>
            <p className="text-sm text-slate-600">{content}</p>

            <div className="flex justify-end mt-6">
                <button
                    type="button"
                    className="flex items-center justify-center gap-1.5 text-xs md:text-sm font-semibold text-rose-700 whitespace-nowrap bg-rose-100/80 border border-rose-200 rounded-full px-4 py-2 cursor-pointer"
                    onClick={onDelete}
                >
                    Delete
                </button>
            </div>
        </div>
    )
}

export default DeleteAlert

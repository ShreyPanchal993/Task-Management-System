import React, { useState } from 'react'
import { HiMiniPlus, HiOutlineTrash } from "react-icons/hi2";
import { LuPaperclip } from 'react-icons/lu';

const AddAttachmentsInputs = ({ attachments, setAttachments }) => {
    const [option, setOption] = useState("");

    // Function to handle adding an option
    const handleAddOption = () => {
        if (option.trim() !== "") {
            setAttachments([...attachments, option]);
            setOption("");
        }
    };

    const handleDeleteOption = (index) => {
        const updatedArr = attachments.filter((_, idx) => idx !== index);
        setAttachments(updatedArr);
    };

    return (
        <div>
            {attachments.map((item, index) => (
                <div
                    key={index}
                    className="flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 px-3.5 py-2.5 rounded-2xl mb-2.5 mt-2 transition-colors"
                >
                    <div className="flex-1 min-w-0 flex items-center gap-2.5">
                        <LuPaperclip className="text-slate-400 dark:text-slate-500 shrink-0" />
                        <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate" title={item}>{item}</p>
                    </div>

                    <button
                        className="cursor-pointer shrink-0 text-slate-400 hover:text-red-500 transition-colors p-1"
                        onClick={() =>
                            handleDeleteOption(index)
                        }
                        aria-label="Delete attachment"
                    >
                        <HiOutlineTrash className="text-lg" />
                    </button>
                </div>
            ))}

            <div className="flex items-center gap-3 sm:gap-4 mt-3">
                <div className="flex-1 flex items-center gap-3 border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/80 rounded-2xl px-3.5 h-[46px]">
                    <LuPaperclip className="text-slate-400 dark:text-slate-500 shrink-0" />

                    <input
                        type="text"
                        placeholder="Add File Link"
                        value={option}
                        onChange={({ target }) => setOption(target.value)}
                        className="w-full text-[13px] text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none bg-transparent py-2"
                    />
                </div>

                <button className="card-btn text-nowrap h-[46px] px-4 flex items-center gap-1.5" onClick={handleAddOption}>
                    <HiMiniPlus className="text-lg" /> Add
                </button>
            </div>
        </div>
    )
}

export default AddAttachmentsInputs
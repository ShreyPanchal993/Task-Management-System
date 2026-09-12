import React, { useState } from 'react'
import { LuChevronDown } from 'react-icons/lu'

const SelectDropdown = ({ options, value, onChange, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (option) => {
        onChange(option);
        setIsOpen(false);
    };

    return (
        <div className="relative w-full mt-2">
            {/* Dropdown Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full h-[50px] text-sm outline-none px-4 py-3.5 rounded-2xl flex justify-between items-center border cursor-pointer transition-all"
                style={{
                    color: "var(--text-strong)",
                    background: "var(--surface-1)",
                    borderColor: isOpen ? "var(--primary)" : "var(--border-soft)",
                    boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.1)"
                }}
            >
                <span className="truncate">{value ? options.find((opt) => opt.value === value)?.label : placeholder}</span>
                <span className="ml-2 text-slate-400 text-sm shrink-0">
                    <LuChevronDown className={`transition-transform duration-200 ${isOpen ? "rotate-180 text-primary" : ""}`} />
                </span>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute w-full rounded-2xl mt-2 shadow-xl z-20 border overflow-hidden backdrop-blur-xl" style={{ background: "var(--popover-bg)", borderColor: "var(--border-soft)" }}>
                    {options.map((option) => (
                        <div
                            key={option.value}
                            onClick={() => handleSelect(option.value)}
                            className="px-4 py-3 text-sm cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-slate-800 dark:text-slate-100"
                        >
                            {option.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default SelectDropdown

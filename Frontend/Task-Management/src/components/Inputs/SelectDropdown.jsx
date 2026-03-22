import React, { useState }from 'react'
import { LuChevronDown } from 'react-icons/lu'

const SelectDropdown = ({ options, value, onChange, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (option) => {
        onChange(option);   
        setIsOpen(false);
    };

    return (
        <div className="relative w-full">
            {/* Dropdown Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full text-sm outline-none px-4 py-3.5 rounded-2xl mt-2 flex justify-between items-center border"
                style={{ color: "var(--text-strong)", background: "rgba(255, 255, 255, 0.78)", borderColor: "var(--border-soft)" }}
            >
                {value ? options.find((opt) => opt.value === value)?.label: placeholder}
                <span className="ml-2">
                    {isOpen ? <LuChevronDown className="rotate-180" /> : <LuChevronDown />}
                </span>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute w-full rounded-2xl mt-2 shadow-xl z-10 border overflow-hidden" style={{ background: "rgba(255, 253, 248, 0.98)", borderColor: "var(--border-soft)" }}>
                    {options.map((option) => (
                        <div
                            key={option.value}
                            onClick={() => handleSelect(option.value)}
                            className="px-4 py-3 text-sm cursor-pointer hover:bg-white"
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

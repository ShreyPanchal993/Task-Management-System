import React, { useState } from 'react'
import { HiOutlineTrash, HiMiniPlus } from 'react-icons/hi2'

const TodoListInput = ({ todoList, setTodoList }) => {
    const [option, setOption] = useState("");

    // Function to handle adding an option
    const handleAddOption = () => {
        if (option.trim()) {
            setTodoList([...todoList, option.trim()]);
            setOption("");
        }
    };

    // Function to handle deleting an option
    const handleDeleteOption = (index) => {
        const updatedArr = todoList.filter((_, idx) => idx !== index);
        setTodoList(updatedArr);
    }

    return (
        <div>
            {todoList.map((item, index) => (
                <div
                    key={index}
                    className="flex justify-between items-center bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 px-3.5 py-2.5 rounded-2xl mb-2.5 mt-2 transition-colors"
                >
                    <p className="text-xs font-medium text-slate-800 dark:text-slate-200">
                        <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold mr-2">
                            {index < 9 ? `0${index + 1}` : index + 1}
                        </span>
                        {item}
                    </p>

                    <button
                        className="cursor-pointer text-slate-400 hover:text-red-500 transition-colors p-1"
                        onClick={() => {
                            handleDeleteOption(index);
                        }}
                        aria-label="Delete item"
                    >
                        <HiOutlineTrash className="text-lg" />
                    </button>
                </div>
            ))}

            <div className="flex items-center gap-3 sm:gap-4 mt-3">
                <input
                    type="text"
                    placeholder="Enter Task"
                    value={option}
                    onChange={({ target }) => setOption(target.value)}
                    className="form-input !mt-0 h-[46px]"
                />
                <button className="card-btn text-nowrap h-[46px] px-4 flex items-center gap-1.5" onClick={handleAddOption}>
                    <HiMiniPlus className="text-lg" /> Add
                </button>
            </div>
        </div>
    )
}

export default TodoListInput
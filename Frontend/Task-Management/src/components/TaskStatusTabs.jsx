import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'

const TaskStatusTabs = ({ tabs, activeTab, setActiveTab }) => {
    const containerRef = useRef(null);
    const tabRefs = useRef({});
    const [highlightStyle, setHighlightStyle] = useState({ opacity: 0 });

    const updateHighlightPosition = () => {
        const activeElement = tabRefs.current[activeTab];
        const containerElement = containerRef.current;

        if (!activeElement || !containerElement) {
            setHighlightStyle({ opacity: 0 });
            return;
        }

        setHighlightStyle({
            opacity: 1,
            width: activeElement.offsetWidth,
            height: activeElement.offsetHeight,
            transform: `translateX(${activeElement.offsetLeft}px)`,
        });
    };

    useLayoutEffect(() => {
        updateHighlightPosition();
    }, [activeTab, tabs]);

    useEffect(() => {
        window.addEventListener("resize", updateHighlightPosition);

        return () => {
            window.removeEventListener("resize", updateHighlightPosition);
        };
    }, [activeTab, tabs]);

    const getInactiveBadgeClass = (label) => {
        switch (label) {
            case 'Pending':
                return 'bg-amber-100/80 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300';
            case 'In Progress':
                return 'bg-sky-100/80 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300';
            case 'Completed':
                return 'bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300';
            default:
                return 'bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300';
        }
    };

    return (
        <div className="max-w-full">
            <div
                ref={containerRef}
                className="relative flex items-center overflow-x-auto no-scrollbar gap-1 sm:gap-1.5 rounded-full border p-1 sm:p-1.5 shadow-xs"
                style={{ background: "var(--surface-1)", borderColor: "var(--border-soft)", backdropFilter: "blur(12px)" }}
            >
                <div
                    className="absolute left-1 sm:left-1.5 top-1 sm:top-1.5 rounded-full transition-all duration-300 ease-out pointer-events-none"
                    style={{
                        ...highlightStyle,
                        background: "linear-gradient(135deg, #2850d9 0%, #1b36a9 100%)",
                        boxShadow: "0 4px 14px rgba(40, 80, 217, 0.32)",
                    }}
                />

                {tabs.map((tab) => {
                    const isActive = activeTab === tab.label;

                    return (
                        <button
                            key={tab.label}
                            ref={(element) => {
                                tabRefs.current[tab.label] = element;
                            }}
                            className={`relative z-10 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-[13px] font-medium rounded-full transition-colors duration-200 shrink-0 ${isActive
                                    ? 'text-white font-semibold'
                                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                                } cursor-pointer`}
                            onClick={() => setActiveTab(tab.label)}
                        >
                            <div className="flex items-center">
                                <span>{tab.label}</span>
                                <span
                                    className={`text-[11px] font-semibold ml-2 px-2 py-0.5 rounded-full transition-colors duration-200 ${isActive
                                            ? 'bg-white/25 text-white shadow-xs'
                                            : getInactiveBadgeClass(tab.label)
                                        }`}
                                >
                                    {tab.count}
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    )
}

export default TaskStatusTabs

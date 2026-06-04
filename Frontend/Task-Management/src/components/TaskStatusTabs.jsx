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

    return (
        <div className="my-2">
            <div
                ref={containerRef}
                className="relative flex flex-wrap gap-2 rounded-full border p-1.5"
                style={{ background: "rgba(255, 255, 255, 0.5)", borderColor: "var(--border-soft)" }}
            >
                <div
                    className="absolute left-1.5 top-1.5 rounded-full shadow-md transition-all duration-300 ease-out"
                    style={{
                        ...highlightStyle,
                        background: "linear-gradient(135deg, #2850d9 0%, #1b36a9 100%)",
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
                            className={`relative z-10 px-3 md:px-4 py-2 text-sm font-medium rounded-full transition-colors duration-300 ${
                                isActive
                                    ? 'text-white'
                                    : 'text-gray-500 hover:text-gray-700'
                            } cursor-pointer`}
                            onClick={() => setActiveTab(tab.label)}
                        >
                            <div className="flex items-center">
                                <span className="text-xs">{tab.label}</span>
                                <span
                                    className={`text-xs ml-2 px-2 py-0.5 rounded-full transition-colors duration-300 ${
                                        isActive
                                            ? 'bg-white/20 text-white'
                                            : 'bg-gray-200/70 text-gray-600'
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

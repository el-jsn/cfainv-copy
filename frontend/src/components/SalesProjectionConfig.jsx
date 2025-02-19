import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    ArrowBackIos,
    AutoAwesome,
    ArrowForward,
    Edit,
    Check,
    Close,
    DragIndicator,
    Timeline,
    DeleteOutline
} from "@mui/icons-material";
import axiosInstance from "./axiosInstance";

const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const PRESETS = {
    "Next Day": "next",
    "Two Days Ahead": "skip",
    "Split Days": "split"
};

const DraggableToken = ({ type, percentage }) => (
    <div
        draggable
        onDragStart={(e) => {
            e.dataTransfer.setData('type', type);
            e.dataTransfer.setData('percentage', percentage);
        }}
        className="flex items-center gap-2 p-3 bg-white rounded-lg shadow-sm 
            hover:shadow-md cursor-grab active:cursor-grabbing transition-all
            border-2 border-transparent hover:border-blue-500"
    >
        <DragIndicator className="text-gray-400" />
        <div className="flex flex-col">
            <span className="font-bold text-lg text-blue-600">{percentage}%</span>
            <span className="text-sm text-gray-500">Drag to assign</span>
        </div>
    </div>
);

const DayToken = ({ day }) => (
    <div
        draggable
        onDragStart={(e) => {
            e.dataTransfer.setData('sourceDay', day);
        }}
        className="flex items-center gap-2 p-3 bg-white rounded-lg shadow-sm 
            hover:shadow-md cursor-grab active:cursor-grabbing transition-all
            border-2 border-transparent hover:border-blue-500"
    >
        <DragIndicator className="text-gray-400" />
        <div className="flex flex-col">
            <span className="font-bold text-lg text-gray-700">{day}</span>
            <span className="text-sm text-gray-500">Drag to assign</span>
        </div>
    </div>
);

const DeleteZone = ({ isOver, onDrop }) => (
    <div
        onDragOver={(e) => {
            e.preventDefault();
            e.currentTarget.classList.add('scale-110', 'bg-red-100');
        }}
        onDragLeave={(e) => {
            e.currentTarget.classList.remove('scale-110', 'bg-red-100');
        }}
        onDrop={(e) => {
            e.currentTarget.classList.remove('scale-110', 'bg-red-100');
            onDrop(e);
        }}
        className={`
            fixed right-8 bottom-8 p-6 rounded-xl transition-all
            ${isOver ? 'bg-red-100 shadow-lg scale-110' : 'bg-white shadow-md'}
        `}
    >
        <div className="flex items-center gap-3">
            <DeleteOutline className={`text-2xl ${isOver ? 'text-red-500' : 'text-gray-400'}`} />
            <span className={isOver ? 'text-red-500' : 'text-gray-500'}>
                Drop here to remove
            </span>
        </div>
    </div>
);

const DayColumn = ({ day, config, onConfigChange }) => {
    const [isOver, setIsOver] = useState(false);
    const [editingDay, setEditingDay] = useState(null);
    const [editValue, setEditValue] = useState("");

    const getAssignments = () => {
        return Object.entries(config[day] || {})
            .filter(([_, value]) => value > 0)
            .map(([sourceDay, value]) => ({
                day: sourceDay,
                value: value
            }));
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsOver(false);
        const sourceDay = e.dataTransfer.getData('sourceDay');
        const valueData = e.dataTransfer.getData('value');
        const tokenValue = valueData ? Number(valueData) : 100;

        if (!sourceDay) return;

        const newConfig = JSON.parse(JSON.stringify(config));

        // Initialize if not exists
        if (!newConfig[day]) {
            newConfig[day] = {};
        }

        // This day will use sourceDay's data
        newConfig[day][sourceDay] = tokenValue;
        onConfigChange(newConfig);
    };

    const handleValueChange = (sourceDay, newValue) => {
        // Allow empty string for editing
        if (newValue === "") {
            setEditValue("");
            return;
        }

        // Parse the number and clamp between 0 and 100
        const value = Math.min(100, Math.max(0, Number(newValue) || 0));
        setEditValue(value.toString());
    };

    const handleValueBlur = (sourceDay) => {
        // Only update if we have a value
        if (editValue !== "") {
            const value = Math.min(100, Math.max(0, Number(editValue) || 0));
            const newConfig = JSON.parse(JSON.stringify(config));
            if (!newConfig[day]) {
                newConfig[day] = {};
            }
            newConfig[day][sourceDay] = value;
            onConfigChange(newConfig);
        }
        setEditingDay(null);
        setEditValue("");
    };

    const handleValueKeyDown = (e, sourceDay) => {
        if (e.key === 'Enter') {
            handleValueBlur(sourceDay);
        } else if (e.key === 'Escape') {
            setEditingDay(null);
            setEditValue("");
        }
    };

    const startEditing = (sourceDay, currentValue) => {
        setEditingDay(sourceDay);
        setEditValue(currentValue.toString());
    };

    return (
        <div
            onDragOver={(e) => {
                if (!editingDay) {  // Only allow drag when not editing
                    e.preventDefault();
                    setIsOver(true);
                }
            }}
            onDragLeave={() => setIsOver(false)}
            onDrop={handleDrop}
            className={`
                flex flex-col gap-3 p-4 rounded-xl transition-all min-h-[200px]
                ${isOver ? 'bg-blue-50 shadow-md' : 'bg-gray-50'}
            `}
        >
            <h3 className="font-bold text-lg">{day}</h3>
            <div className="flex flex-col gap-2">
                {getAssignments().map(({ day: sourceDay, value }) => (
                    <div
                        key={sourceDay}
                        draggable={editingDay !== sourceDay}
                        onDragStart={(e) => {
                            if (editingDay !== sourceDay) {
                                e.dataTransfer.setData('sourceDay', sourceDay);
                                e.dataTransfer.setData('targetDay', day);
                                e.dataTransfer.setData('value', value);
                            }
                        }}
                        className={`
                            flex items-center justify-between p-2 bg-white rounded-lg shadow-sm 
                            ${editingDay !== sourceDay ? 'hover:shadow-md cursor-grab' : ''}
                        `}
                    >
                        <span className="text-sm font-medium">{sourceDay}</span>
                        {editingDay === sourceDay ? (
                            <input
                                type="text"
                                value={editValue}
                                onChange={(e) => handleValueChange(sourceDay, e.target.value)}
                                onBlur={() => handleValueBlur(sourceDay)}
                                onKeyDown={(e) => handleValueKeyDown(e, sourceDay)}
                                autoFocus
                                className="w-16 text-right text-sm font-bold text-blue-600 border rounded px-1 py-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                onClick={(e) => e.stopPropagation()}
                            />
                        ) : (
                            <span
                                className="text-sm text-blue-600 font-bold cursor-pointer hover:bg-blue-50 px-2 py-1 rounded"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    startEditing(sourceDay, value);
                                }}
                            >
                                {value}%
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

const SalesProjectionConfig = () => {
    const [config, setConfig] = useState(null);
    const [hasChanges, setHasChanges] = useState(false);
    const [originalConfig, setOriginalConfig] = useState(null);
    const [deleteZoneActive, setDeleteZoneActive] = useState(false);

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const response = await axiosInstance.get("/sales-projection-config");

                if (response.data) {
                    // Initialize the structure
                    const completeConfig = {};
                    WEEKDAYS.forEach(sourceDay => {
                        completeConfig[sourceDay] = {};
                        WEEKDAYS.forEach(targetDay => {
                            completeConfig[sourceDay][targetDay] = 0;
                        });
                    });

                    // Reorganize the data to match our display structure
                    WEEKDAYS.forEach(targetDay => {
                        WEEKDAYS.forEach(sourceDay => {
                            // If source day has a value for this target day, use it
                            if (response.data[sourceDay]?.[targetDay] !== undefined) {
                                completeConfig[sourceDay][targetDay] =
                                    Number(response.data[sourceDay][targetDay]);
                            }
                        });
                    });

                    console.log('Backend response:', response.data);
                    console.log('Complete config:', completeConfig);

                    setConfig(completeConfig);
                    setOriginalConfig(JSON.parse(JSON.stringify(completeConfig)));
                }
            } catch (error) {
                console.error("Error fetching configuration:", error);
            }
        };
        fetchConfig();
    }, []);

    useEffect(() => {
        if (originalConfig && config) {
            // Deep comparison of the configurations
            setHasChanges(JSON.stringify(config) !== JSON.stringify(originalConfig));
        }
    }, [config, originalConfig]);

    const handlePresetClick = (preset) => {
        const newConfig = {};

        // Initialize the config structure first
        WEEKDAYS.forEach(sourceDay => {
            newConfig[sourceDay] = {};
            WEEKDAYS.forEach(targetDay => {
                newConfig[sourceDay][targetDay] = 0;
            });
        });

        // Apply the preset logic
        WEEKDAYS.forEach((day, index) => {
            if (preset === "next") {
                const nextDay = WEEKDAYS[(index + 1) % WEEKDAYS.length];
                newConfig[day][nextDay] = 100;
            } else if (preset === "skip") {
                const skipDay = WEEKDAYS[(index + 2) % WEEKDAYS.length];
                newConfig[day][skipDay] = 100;
            } else if (preset === "split") {
                const nextDay = WEEKDAYS[(index + 1) % WEEKDAYS.length];
                const skipDay = WEEKDAYS[(index + 2) % WEEKDAYS.length];
                newConfig[day][nextDay] = 70;
                newConfig[day][skipDay] = 30;
            }
        });

        setConfig(newConfig);
    };

    const handleSave = async () => {
        try {
            // Reorganize the data to match the backend's expected structure
            const configToSave = {};
            WEEKDAYS.forEach(sourceDay => {
                configToSave[sourceDay] = {};
                WEEKDAYS.forEach(targetDay => {
                    configToSave[sourceDay][targetDay] = Number(config[sourceDay][targetDay] || 0);
                });
            });

            await axiosInstance.post("/sales-projection-config", configToSave);
            setOriginalConfig(JSON.parse(JSON.stringify(config)));
            setHasChanges(false);
            alert("Configuration saved successfully!");
        } catch (error) {
            console.error("Error saving configuration:", error);
            alert("Error saving configuration");
        }
    };

    const handleDeleteDrop = (e) => {
        e.preventDefault();
        setDeleteZoneActive(false);

        const sourceDay = e.dataTransfer.getData('sourceDay');
        const targetDay = e.dataTransfer.getData('targetDay');

        if (!sourceDay || !targetDay) return;

        // Create a new config object to ensure React detects the change
        const newConfig = JSON.parse(JSON.stringify(config));

        // Remove the specific assignment
        if (newConfig[targetDay]) {
            newConfig[targetDay][sourceDay] = 0;
        }

        setConfig(newConfig);
        setHasChanges(true);  // Make sure we enable the save button
    };

    // Add global drag events to show/hide delete zone
    useEffect(() => {
        const handleDragStart = () => setDeleteZoneActive(true);
        const handleDragEnd = () => setDeleteZoneActive(false);

        window.addEventListener('dragstart', handleDragStart);
        window.addEventListener('dragend', handleDragEnd);

        return () => {
            window.removeEventListener('dragstart', handleDragStart);
            window.removeEventListener('dragend', handleDragEnd);
        };
    }, []);

    if (!config) return <div>Loading...</div>;

    return (
        <div className="container mx-auto p-6 max-w-7xl">
            <div className="mb-6 flex justify-between items-center">
                <Link to="/" className="text-xl font-bold flex items-center gap-2">
                    <ArrowBackIos /> Sales Projection
                </Link>
                <div className="flex gap-3">
                    {hasChanges && (
                        <button
                            onClick={() => {
                                setConfig(JSON.parse(JSON.stringify(originalConfig)));
                                setHasChanges(false);
                            }}
                            className="px-6 py-2 rounded-lg transition-all
                                bg-gray-100 text-gray-600 hover:bg-gray-200 
                                shadow-sm hover:shadow-md"
                        >
                            Cancel Changes
                        </button>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={!hasChanges}
                        className={`
                            px-6 py-2 rounded-lg transition-all
                            ${hasChanges
                                ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-md hover:shadow-lg'
                                : 'bg-gray-200 text-gray-500'}
                        `}
                    >
                        {hasChanges ? 'Save Changes' : 'No Changes'}
                    </button>
                </div>
            </div>

            <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                    <AutoAwesome className="text-yellow-500" />
                    <h2 className="text-xl font-bold">Quick Setup</h2>
                </div>
                <div className="flex gap-4">
                    {Object.entries(PRESETS).map(([name, value]) => (
                        <button
                            key={name}
                            onClick={() => handlePresetClick(value)}
                            className="px-6 py-3 rounded-xl bg-white shadow-sm hover:shadow-md transition-all"
                        >
                            {name}
                        </button>
                    ))}
                </div>
            </div>

            <div className="mb-8 bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-bold mb-4">Source Days</h3>
                <div className="flex gap-4 flex-wrap">
                    {WEEKDAYS.map(day => (
                        <DayToken key={day} day={day} />
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {WEEKDAYS.map(day => (
                    <DayColumn
                        key={day}
                        day={day}
                        config={config}
                        onConfigChange={setConfig}
                    />
                ))}
            </div>

            {/* Delete Zone */}
            {deleteZoneActive && (
                <DeleteZone
                    isOver={deleteZoneActive}
                    onDrop={handleDeleteDrop}
                />
            )}
        </div>
    );
};

export default SalesProjectionConfig; 
import React, { useState, useEffect, useMemo } from "react";
import axiosInstance from "./axiosInstance";
import { Calendar, PlusCircle, Edit2, Trash2, Save, X, AlertCircle, Search, ChevronRight, ChevronLeft, RefrigeratorIcon, UtensilsCrossed } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Tooltip } from "react-tooltip";
import useHotkeys from "@reecelucas/react-use-hotkeys";

const InstructionManager = () => {
    const [selectedDays, setSelectedDays] = useState([]);
    const [message, setMessage] = useState("");
    const [instructions, setInstructions] = useState([]);
    const [editingInstruction, setEditingInstruction] = useState(null);
    const [error, setError] = useState("");
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [disabledProductMessage, setDisabledProductMessage] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
    const [activeTab, setActiveTab] = useState("days"); // ["days", "products"]
    const [mode, setMode] = useState("thawing"); // "thawing" or "prep"

    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    // Combined product options based on mode
    const productOptions = useMemo(() => {
        const thawingProducts = ["Filets", "Spicy Filets", "Nuggets", "Spicy Strips", "Grilled Filets", "Grilled Nuggets"];
        const prepProducts = ["Lettuce", "Tomato", "Romaine", "Cobb Salad", "Southwest Salad", "Lemonade", "Diet Lemonade", "Sunjoy Lemonade"];

        return mode === "thawing" ? thawingProducts : prepProducts;
    }, [mode]);

    // Theme colors based on mode
    const themeColors = {
        thawing: {
            primary: "indigo",
            icon: <RefrigeratorIcon className="w-5 h-5" />,
            title: "Thawing Cabinet"
        },
        prep: {
            primary: "green",
            icon: <UtensilsCrossed className="w-5 h-5" />,
            title: "Prep Allocations"
        }
    };

    // Dynamic classes based on current mode
    const getThemeClass = (type) => {
        const color = themeColors[mode].primary;
        switch (type) {
            case "button":
                return `bg-${color}-600 hover:bg-${color}-700`;
            case "text":
                return `text-${color}-600`;
            case "border":
                return `border-${color}-500`;
            case "bg-light":
                return `bg-${color}-100`;
            case "hover-text":
                return `hover:text-${color}-600`;
            case "hover-bg":
                return `hover:bg-${color}-50`;
            default:
                return "";
        }
    };

    // Keyboard shortcuts
    useHotkeys("ctrl+s", (e) => {
        e.preventDefault();
        if (message.trim()) handleAddOrUpdateInstruction();
    });
    useHotkeys("esc", () => {
        if (editingInstruction) handleCancelEdit();
    });

    useEffect(() => {
        fetchInstructions();
    }, []);

    const fetchInstructions = async () => {
        try {
            const response = await axiosInstance.get("/messages");
            setInstructions(response.data);
        } catch (error) {
            setError("Failed to fetch instructions. Please try again.");
        }
    };

    const handleAddOrUpdateInstruction = async () => {
        if (!message.trim()) {
            setError("Message cannot be empty!");
            return;
        }
        const products = selectedProducts.join(",");
        // Add [PREP] tag for prep mode instructions
        const taggedMessage = mode === "prep" ? `[PREP] ${message}` : message;

        try {
            for (const day of selectedDays) {
                if (editingInstruction) {
                    await axiosInstance.put(`/messages/${editingInstruction._id}`, { message: taggedMessage, products, day });
                    setInstructions(prev =>
                        prev.map(inst => (inst._id === editingInstruction._id && inst.day === day ? { ...inst, message: taggedMessage, products } : inst))
                    );
                    setEditingInstruction(null);
                } else {
                    const response = await axiosInstance.post("/messages", { day, message: taggedMessage, products });
                    setInstructions(prev => [...prev, response.data]);
                }
            }
            setMessage("");
            setSelectedProducts([]);
            setSelectedDays([]);
            setError("");
        } catch (error) {
            setError(error.response?.data?.message || "Failed to save instruction. Please try again.");
        }
    };

    const handleEditInstruction = (instruction) => {
        // Remove [PREP] tag when editing
        const cleanMessage = instruction.message.startsWith("[PREP]")
            ? instruction.message.substring(6).trim()
            : instruction.message;

        setMessage(cleanMessage);
        setSelectedProducts(instruction.products ? instruction.products.split(",") : []);
        setSelectedDays([instruction.day]);
        setEditingInstruction(instruction);
    };

    const handleCancelEdit = () => {
        setMessage("");
        setSelectedProducts([]);
        setSelectedDays([]);
        setEditingInstruction(null);
    };

    const handleDeleteInstruction = async (instruction) => {
        try {
            await axiosInstance.delete(`/messages/${instruction._id}`);
            setInstructions(prev => prev.filter(inst => inst._id !== instruction._id));
        } catch (error) {
            setError("Failed to delete instruction. Please try again.");
        }
    };
    const handleProductSelect = (product) => {
        if (selectedProducts.includes(product)) {
            // Deselect only if the product is currently selected
            if (disabledProducts.includes(product)) {
                setSelectedProducts(prev => prev.filter(p => p !== product));
                return;
            } else {
                setSelectedProducts(prev => prev.filter(p => p !== product));
                return;
            }
        }


        let message = null
        for (const day of selectedDays) {
            const existingInstruction = instructions.find(inst => inst.day === day && inst.products && inst.products.split(",").includes(product) && (!editingInstruction || inst._id !== editingInstruction._id));

            if (existingInstruction) {
                message = `An instruction for ${product} already exists on ${day}!`;
                break;
            }
        }

        if (message) {
            setDisabledProductMessage(message);
            setTimeout(() => {
                setDisabledProductMessage(null);
            }, 3000);
            return
        }

        setSelectedProducts(prev => [...prev, product]);
    };

    const handleDaySelect = (day) => {
        // check if the day is already selected, and if it is, then remove it from the selected list
        if (selectedDays.includes(day)) {
            setSelectedDays(prev => prev.filter(d => d !== day));
            return
        }
        setSelectedDays(prev => [...prev, day]);
    };

    const handleMouseEnterProduct = (product) => {
        if (disabledProducts.includes(product)) {
            let message = "";
            for (const day of selectedDays) {
                const existingInstruction = instructions.find(inst => inst.day === day && inst.products && inst.products.split(",").includes(product) && (!editingInstruction || inst._id !== editingInstruction._id));
                if (existingInstruction) {
                    message = `Already exists for ${day}`;
                    break;
                }
            }

            setDisabledProductMessage(`${product} ${message}`)
        }
    }
    const handleMouseLeaveProduct = () => {
        setDisabledProductMessage(null);
    };

    const disabledProducts = useMemo(() => {
        if (!selectedDays || selectedDays.length === 0) return [];
        const productsInUse = instructions
            .filter(inst => {
                setSelectedProducts([]);
                // Check if any selected day is included in the instruction
                return selectedDays.includes(inst.day) && (!editingInstruction || inst._id !== editingInstruction._id);
            })
            .flatMap(inst => (inst.products ? inst.products.split(",") : []));
        return productsInUse;
    }, [instructions, selectedDays, editingInstruction]);

    const filteredInstructions = useMemo(() => {
        // First filter by mode
        let modeFiltered = instructions.filter(inst => {
            const isPrep = inst.message.startsWith("[PREP]");
            return mode === "prep" ? isPrep : !isPrep;
        });

        // Then filter by search term if it exists
        if (!searchTerm) return modeFiltered;

        const term = searchTerm.toLowerCase();
        return modeFiltered.filter(
            inst =>
                inst.day.toLowerCase().includes(term) ||
                inst.message.toLowerCase().includes(term) ||
                (inst.products && inst.products.toLowerCase().includes(term))
        );
    }, [instructions, searchTerm, mode]);

    const handleDragEnd = (result) => {
        if (!result.destination) return;

        const items = Array.from(instructions);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);

        setInstructions(items);
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans antialiased">
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Header with Mode Toggle */}
                <div className="flex justify-between items-center mb-8">
                    <motion.header
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-left"
                    >
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                            {themeColors[mode].icon}
                            {themeColors[mode].title}
                        </h1>
                        <p className="mt-3 text-gray-500 text-lg">
                            Plan your week with clear and concise instructions
                        </p>
                    </motion.header>

                    {/* Mode Toggle */}
                    <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
                        <button
                            onClick={() => setMode("thawing")}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all
                                ${mode === "thawing"
                                    ? "bg-white text-indigo-600 shadow-sm"
                                    : "text-gray-500 hover:text-gray-700"}`}
                        >
                            <RefrigeratorIcon className="w-4 h-4" />
                            Thawing
                        </button>
                        <button
                            onClick={() => setMode("prep")}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all
                                ${mode === "prep"
                                    ? "bg-white text-green-600 shadow-sm"
                                    : "text-gray-500 hover:text-gray-700"}`}
                        >
                            <UtensilsCrossed className="w-4 h-4" />
                            Prep
                        </button>
                    </div>
                </div>

                {/* Error Message */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="rounded-md bg-red-50 border-l-4 border-red-400 p-4 mb-6"
                        >
                            <div className="flex">
                                <AlertCircle className="h-5 w-5 text-red-400" />
                                <div className="ml-3">
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                                <button
                                    onClick={() => setError("")}
                                    className="ml-auto"
                                >
                                    <X className="h-5 w-5 text-red-400" />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Main Content */}
                <div className="flex gap-6">
                    {/* Left Panel - Input Form */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{
                            opacity: 1,
                            x: 0,
                            width: isPanelCollapsed ? "60px" : "400px"
                        }}
                        className="bg-white shadow-lg rounded-xl border border-gray-200 h-[calc(100vh-200px)] flex"
                    >
                        <div className="flex-1 overflow-hidden flex flex-col">
                            {!isPanelCollapsed && (
                                <>
                                    <div className="p-6 flex-1 overflow-y-auto">
                                        <div className="flex items-center mb-6 border-b border-gray-200 pb-4">
                                            {themeColors[mode].icon}
                                            <h3 className="text-xl font-semibold text-gray-900 ml-3">
                                                {editingInstruction ? 'Edit Instruction' : 'Add Instruction'}
                                            </h3>
                                        </div>

                                        {/* Tabs */}
                                        <div className="flex space-x-4 mb-6">
                                            <button
                                                onClick={() => setActiveTab("days")}
                                                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all
                                                    ${activeTab === "days"
                                                        ? "bg-indigo-100 text-indigo-700 border-2 border-indigo-500"
                                                        : "bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-gray-300"
                                                    }`}
                                            >
                                                Days
                                            </button>
                                            <button
                                                onClick={() => setActiveTab("products")}
                                                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all
                                                    ${activeTab === "products"
                                                        ? "bg-indigo-100 text-indigo-700 border-2 border-indigo-500"
                                                        : "bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-gray-300"
                                                    }`}
                                            >
                                                Products
                                            </button>
                                        </div>

                                        {/* Content based on active tab */}
                                        <AnimatePresence mode="wait">
                                            {activeTab === "days" ? (
                                                <motion.div
                                                    key="days"
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="space-y-4"
                                                >
                                                    <label className="block text-sm font-medium text-gray-700">
                                                        Select Days
                                                    </label>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {daysOfWeek.map((day) => (
                                                            <button
                                                                key={day}
                                                                onClick={() => handleDaySelect(day)}
                                                                className={`p-2 rounded-lg text-sm font-medium transition-all
                                                                    ${selectedDays.includes(day)
                                                                        ? `${mode === "thawing"
                                                                            ? "bg-indigo-100 text-indigo-700 border-2 border-indigo-500"
                                                                            : "bg-green-100 text-green-700 border-2 border-green-500"}`
                                                                        : 'bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-gray-300'
                                                                    }`}
                                                            >
                                                                {day}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            ) : (
                                                <motion.div
                                                    key="products"
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="space-y-4"
                                                >
                                                    <label className="block text-sm font-medium text-gray-700">
                                                        Select Products
                                                    </label>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {productOptions.map((product) => (
                                                            <button
                                                                key={product}
                                                                onClick={() => handleProductSelect(product)}
                                                                disabled={disabledProducts.includes(product)}
                                                                onMouseEnter={() => handleMouseEnterProduct(product)}
                                                                onMouseLeave={handleMouseLeaveProduct}
                                                                data-tooltip-id={`product-${product}`}
                                                                className={`p-2 rounded-lg text-sm font-medium transition-all
                                                                    ${selectedProducts.includes(product)
                                                                        ? `${mode === "thawing"
                                                                            ? "bg-indigo-100 text-indigo-700 border-2 border-indigo-500"
                                                                            : "bg-green-100 text-green-700 border-2 border-green-500"}`
                                                                        : 'bg-gray-50 text-gray-700 border-2 border-gray-200 hover:border-gray-300'
                                                                    } ${disabledProducts.includes(product) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                            >
                                                                {product}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {/* Message Input */}
                                        <div className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Instruction Message
                                            </label>
                                            <textarea
                                                value={message}
                                                onChange={(e) => setMessage(e.target.value)}
                                                rows={4}
                                                className={`w-full rounded-lg border-gray-300 shadow-sm text-gray-800 text-sm resize-none transition-colors
                                                    focus:ring-2 focus:ring-offset-2 ${mode === "thawing"
                                                        ? "focus:border-indigo-500 focus:ring-indigo-500"
                                                        : "focus:border-green-500 focus:ring-green-500"}`}
                                                placeholder="Enter your instruction here..."
                                            />
                                        </div>
                                    </div>

                                    {/* Persistent Action Bar */}
                                    <div className="p-4 border-t border-gray-200 bg-gray-50">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                                                {selectedDays.length > 0 && (
                                                    <span>{selectedDays.length} day{selectedDays.length !== 1 ? 's' : ''} selected</span>
                                                )}
                                                {selectedProducts.length > 0 && (
                                                    <span>• {selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''} selected</span>
                                                )}
                                            </div>
                                            <div className="flex space-x-3">
                                                {editingInstruction && (
                                                    <button
                                                        onClick={handleCancelEdit}
                                                        className="px-4 py-2 rounded-lg text-gray-700 bg-gray-200 hover:bg-gray-300 font-medium text-sm transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
                                                <button
                                                    onClick={handleAddOrUpdateInstruction}
                                                    disabled={!message.trim() || selectedDays.length === 0}
                                                    className={`px-6 py-2 rounded-lg text-white font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center
                                                        ${mode === "thawing"
                                                            ? "bg-indigo-600 hover:bg-indigo-700"
                                                            : "bg-green-600 hover:bg-green-700"}`}
                                                >
                                                    {editingInstruction ? (
                                                        <>
                                                            <Save className="w-4 h-4 mr-2" />
                                                            Update
                                                        </>
                                                    ) : (
                                                        <>
                                                            <PlusCircle className="w-4 h-4 mr-2" />
                                                            Save
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                        {/* Collapse/Expand Button */}
                        <button
                            onClick={() => setIsPanelCollapsed(!isPanelCollapsed)}
                            className="w-6 border-l border-gray-200 flex items-center justify-center hover:bg-gray-50"
                        >
                            {isPanelCollapsed ? (
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                            ) : (
                                <ChevronLeft className="w-4 h-4 text-gray-400" />
                            )}
                        </button>
                    </motion.div>

                    {/* Right Panel - Instructions List */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex-1 bg-white shadow-lg rounded-xl border border-gray-200 h-[calc(100vh-200px)] overflow-hidden"
                    >
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-4">
                                <h3 className="text-xl font-semibold text-gray-900">
                                    Current Week's Instructions
                                </h3>
                                <div className="relative">
                                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Search instructions..."
                                        className={`pl-10 pr-4 py-2 rounded-lg border border-gray-300 text-sm transition-colors
                                            ${mode === "thawing"
                                                ? "focus:border-indigo-500 focus:ring-indigo-500"
                                                : "focus:border-green-500 focus:ring-green-500"}`}
                                    />
                                </div>
                            </div>

                            <DragDropContext onDragEnd={handleDragEnd}>
                                <Droppable droppableId="instructions">
                                    {(provided) => (
                                        <ul
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                            className="space-y-4 overflow-y-auto max-h-[calc(100vh-350px)]"
                                        >
                                            <AnimatePresence>
                                                {filteredInstructions.length > 0 ? (
                                                    filteredInstructions.map((inst, index) => (
                                                        <Draggable
                                                            key={inst._id}
                                                            draggableId={inst._id}
                                                            index={index}
                                                        >
                                                            {(provided, snapshot) => (
                                                                <motion.li
                                                                    ref={provided.innerRef}
                                                                    {...provided.draggableProps}
                                                                    initial={{ opacity: 0, y: 20 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    exit={{ opacity: 0, y: -20 }}
                                                                    className={`p-4 rounded-lg border ${snapshot.isDragging
                                                                        ? mode === "thawing"
                                                                            ? 'border-indigo-500 shadow-lg'
                                                                            : 'border-green-500 shadow-lg'
                                                                        : 'border-gray-200'
                                                                        } bg-white`}
                                                                >
                                                                    <div className="flex items-start justify-between">
                                                                        <div className="flex-1">
                                                                            <div {...provided.dragHandleProps} className="flex items-center mb-2">
                                                                                <span className={`text-sm font-semibold px-3 py-1 rounded-full
                                                                                    ${mode === "thawing"
                                                                                        ? "text-indigo-600 bg-indigo-50"
                                                                                        : "text-green-600 bg-green-50"}`}>
                                                                                    {inst.day}
                                                                                </span>
                                                                            </div>
                                                                            <p className="text-gray-700 text-sm">
                                                                                {inst.message.startsWith("[PREP]")
                                                                                    ? inst.message.substring(6).trim()
                                                                                    : inst.message}
                                                                            </p>
                                                                            {inst.products && (
                                                                                <div className="mt-2 flex flex-wrap gap-2">
                                                                                    {inst.products.split(",").map((product, idx) => (
                                                                                        <span
                                                                                            key={idx}
                                                                                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                                                                                        >
                                                                                            {product}
                                                                                        </span>
                                                                                    ))}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        <div className="flex items-center space-x-2 ml-4">
                                                                            <button
                                                                                onClick={() => handleEditInstruction(inst)}
                                                                                className={`p-1 rounded-md text-gray-400 transition-colors
                                                                                    ${mode === "thawing"
                                                                                        ? "hover:text-indigo-600 hover:bg-indigo-50"
                                                                                        : "hover:text-green-600 hover:bg-green-50"}`}
                                                                            >
                                                                                <Edit2 className="w-4 h-4" />
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleDeleteInstruction(inst)}
                                                                                className="p-1 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                                                            >
                                                                                <Trash2 className="w-4 h-4" />
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </motion.li>
                                                            )}
                                                        </Draggable>
                                                    ))
                                                ) : (
                                                    <motion.li
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        className="text-center py-8"
                                                    >
                                                        {themeColors[mode].icon}
                                                        <p className="text-sm text-gray-500 mt-4">
                                                            {searchTerm
                                                                ? "No instructions found matching your search"
                                                                : "No instructions added yet. Let's plan your week!"}
                                                        </p>
                                                    </motion.li>
                                                )}
                                            </AnimatePresence>
                                            {provided.placeholder}
                                        </ul>
                                    )}
                                </Droppable>
                            </DragDropContext>
                        </div>
                    </motion.div>
                </div>

                {/* Tooltips */}
                {productOptions.map((product) => (
                    <Tooltip
                        key={product}
                        id={`product-${product}`}
                        place="top"
                        content={disabledProducts.includes(product) ? `${product} already has an instruction for selected day(s)` : product}
                    />
                ))}
            </div>
        </div>
    );
};

export default InstructionManager;
import React, { useState, useEffect, useMemo } from "react";
import axiosInstance from "./axiosInstance";
import {
    Calendar,
    PlusCircle,
    Edit2,
    Trash2,
    Save,
    X,
    AlertCircle,
    Search,
    ChevronRight,
    ChevronLeft,
    RefrigeratorIcon,
    UtensilsCrossed,
    Clock,
    CheckCircle2,
    ListChecks,
    Layers
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Tooltip } from "react-tooltip";
import useHotkeys from "@reecelucas/react-use-hotkeys";

// Chick-fil-A brand colors
const CFA_COLORS = {
    red: "#E51636",       // Primary brand red
    darkRed: "#C41230",   // Darker shade for hover states
    black: "#000000",     // For text and accents
    white: "#FFFFFF",     // For backgrounds and text
    gray: {
        50: "#F9FAFB",
        100: "#F3F4F6",
        200: "#E5E7EB",
        300: "#D1D5DB",
        400: "#9CA3AF",
        500: "#6B7280",
        600: "#4B5563",
        700: "#374151",
        800: "#1F2937",
        900: "#111827",
    }
};

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
            primary: CFA_COLORS.red,
            secondary: "#E8F1FF", // Light blue background
            icon: <RefrigeratorIcon className="w-5 h-5" style={{ color: CFA_COLORS.red }} />,
            title: "Thawing Cabinet"
        },
        prep: {
            primary: "#2D8A54", // Green with CFA touch
            secondary: "#EDFAF1", // Light green background
            icon: <UtensilsCrossed className="w-5 h-5" style={{ color: "#2D8A54" }} />,
            title: "Prep Allocations"
        }
    };

    // Dynamic classes based on current mode
    const getThemeClass = (type) => {
        const color = mode === "thawing" ? CFA_COLORS.red : themeColors.prep.primary;

        switch (type) {
            case "button":
                return `bg-[${color}] hover:bg-[${mode === "thawing" ? CFA_COLORS.darkRed : "#236F44"}]`;
            case "text":
                return `text-[${color}]`;
            case "border":
                return `border-[${color}]`;
            case "bg-light":
                return `bg-[${mode === "thawing" ? themeColors.thawing.secondary : themeColors.prep.secondary}]`;
            case "hover-text":
                return `hover:text-[${color}]`;
            case "hover-bg":
                return `hover:bg-[${mode === "thawing" ? "#FFF1F3" : "#F0FAF5"}]`;
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
                    // The backend API expects the day in the URL, not the ID
                    // Also need to pass the day in the request body
                    await axiosInstance.put(`/messages/${day}`, { message: taggedMessage, products, day });

                    // Update the local state
                    setInstructions(prev =>
                        prev.map(inst =>
                            // Match by day instead of ID for the edited instruction
                            (inst.day === day && (inst._id === editingInstruction._id || inst.day === editingInstruction.day))
                                ? { ...inst, message: taggedMessage, products }
                                : inst
                        )
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
        <div className="min-h-screen bg-[#F9FAFB] font-sans antialiased">
            <div className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
                {/* Header with Mode Toggle */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 sm:mb-8 gap-4"
                >
                    <header className="text-left">
                        <h1 className="text-2xl sm:text-3xl font-bold text-[#1F2937] tracking-tight flex items-center gap-3">
                            {themeColors[mode].icon}
                            {themeColors[mode].title}
                        </h1>
                        <p className="mt-2 text-[#6B7280] text-sm sm:text-base">
                            Plan your week with clear and concise instructions
                        </p>
                    </header>

                    {/* Mode Toggle */}
                    <div className="flex items-center gap-2 bg-white p-1 rounded-lg shadow-sm border border-[#E5E7EB] self-stretch md:self-auto">
                        <button
                            onClick={() => setMode("thawing")}
                            className="flex-1 md:flex-auto flex items-center gap-2 px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-all"
                            style={{
                                backgroundColor: mode === "thawing" ? CFA_COLORS.red : "",
                                color: mode === "thawing" ? "white" : "#6B7280"
                            }}
                        >
                            <RefrigeratorIcon className="w-4 h-4" />
                            Thawing
                        </button>
                        <button
                            onClick={() => setMode("prep")}
                            className="flex-1 md:flex-auto flex items-center gap-2 px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-all"
                            style={{
                                backgroundColor: mode === "prep" ? themeColors.prep.primary : "",
                                color: mode === "prep" ? "white" : "#6B7280"
                            }}
                        >
                            <UtensilsCrossed className="w-4 h-4" />
                            Prep
                        </button>
                    </div>
                </motion.div>

                {/* Error Message */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="rounded-md bg-[#FEF2F2] border-l-4 border-[#F87171] p-4 mb-6"
                        >
                            <div className="flex">
                                <AlertCircle className="h-5 w-5 text-[#EF4444]" />
                                <div className="ml-3">
                                    <p className="text-sm text-[#B91C1C]">{error}</p>
                                </div>
                                <button
                                    onClick={() => setError("")}
                                    className="ml-auto"
                                >
                                    <X className="h-5 w-5 text-[#EF4444]" />
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Main Content */}
                <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
                    {/* Left Panel - Input Form */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{
                            opacity: 1,
                            x: 0,
                            width: isPanelCollapsed ? "60px" : "100%",
                            maxWidth: isPanelCollapsed ? "60px" : "400px",
                            flex: isPanelCollapsed ? "0 0 60px" : "0 0 100%"
                        }}
                        className="bg-white shadow-md rounded-xl border border-[#E5E7EB] h-[calc(100vh-180px)] sm:h-[calc(100vh-200px)] flex lg:max-w-[400px]"
                    >
                        <div className="flex-1 overflow-hidden flex flex-col">
                            {!isPanelCollapsed && (
                                <>
                                    <div className="p-5 flex-1 overflow-y-auto">
                                        <div className="flex items-center mb-5 border-b border-[#E5E7EB] pb-4">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${mode === "thawing" ? "bg-[#FFF1F3]" : "bg-[#F0FAF5]"}`}>
                                                {themeColors[mode].icon}
                                            </div>
                                            <h3 className="text-xl font-semibold text-[#1F2937] ml-3">
                                                {editingInstruction ? 'Edit Instruction' : 'Add Instruction'}
                                            </h3>
                                        </div>

                                        {/* Tabs */}
                                        <div className="flex space-x-3 mb-5">
                                            <button
                                                onClick={() => setActiveTab("days")}
                                                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all
                                                    ${activeTab === "days"
                                                        ? `bg-[${mode === "thawing" ? CFA_COLORS.red : themeColors.prep.primary}] text-white`
                                                        : "bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]"
                                                    }`}
                                                style={{
                                                    backgroundColor: activeTab === "days"
                                                        ? (mode === "thawing" ? CFA_COLORS.red : themeColors.prep.primary)
                                                        : "#F3F4F6"
                                                }}
                                            >
                                                <div className="flex items-center justify-center gap-2">
                                                    <Calendar className="w-4 h-4" />
                                                    Days
                                                </div>
                                            </button>
                                            <button
                                                onClick={() => setActiveTab("products")}
                                                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all
                                                    ${activeTab === "products"
                                                        ? `bg-[${mode === "thawing" ? CFA_COLORS.red : themeColors.prep.primary}] text-white`
                                                        : "bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]"
                                                    }`}
                                                style={{
                                                    backgroundColor: activeTab === "products"
                                                        ? (mode === "thawing" ? CFA_COLORS.red : themeColors.prep.primary)
                                                        : "#F3F4F6"
                                                }}
                                            >
                                                <div className="flex items-center justify-center gap-2">
                                                    <Layers className="w-4 h-4" />
                                                    Products
                                                </div>
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
                                                    <label className="block text-sm font-medium text-[#4B5563]">
                                                        Select Days
                                                    </label>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {daysOfWeek.map((day) => (
                                                            <button
                                                                key={day}
                                                                onClick={() => handleDaySelect(day)}
                                                                className={`p-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1
                                                                    ${selectedDays.includes(day)
                                                                        ? `${mode === "thawing"
                                                                            ? `bg-[${CFA_COLORS.red}] text-white`
                                                                            : `bg-[${themeColors.prep.primary}] text-white`}`
                                                                        : 'bg-white text-[#4B5563] border border-[#E5E7EB] hover:bg-[#F9FAFB]'
                                                                    }`}
                                                                style={{
                                                                    backgroundColor: selectedDays.includes(day)
                                                                        ? (mode === "thawing" ? CFA_COLORS.red : themeColors.prep.primary)
                                                                        : ""
                                                                }}
                                                            >
                                                                {selectedDays.includes(day) && <CheckCircle2 className="w-3 h-3" />}
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
                                                    <label className="block text-sm font-medium text-[#4B5563]">
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
                                                                className={`p-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1
                                                                    ${selectedProducts.includes(product)
                                                                        ? `${mode === "thawing"
                                                                            ? `bg-[${CFA_COLORS.red}] text-white`
                                                                            : `bg-[${themeColors.prep.primary}] text-white`}`
                                                                        : 'bg-white text-[#4B5563] border border-[#E5E7EB] hover:bg-[#F9FAFB]'
                                                                    } ${disabledProducts.includes(product) ? 'opacity-40 cursor-not-allowed' : ''}`}
                                                                style={{
                                                                    backgroundColor: selectedProducts.includes(product) && !disabledProducts.includes(product)
                                                                        ? (mode === "thawing" ? CFA_COLORS.red : themeColors.prep.primary)
                                                                        : ""
                                                                }}
                                                            >
                                                                {selectedProducts.includes(product) && <CheckCircle2 className="w-3 h-3" />}
                                                                {product}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {/* Message Input */}
                                        <div className="space-y-2 mt-5">
                                            <label className="block text-sm font-medium text-[#4B5563]">
                                                Instruction Message
                                            </label>
                                            <textarea
                                                value={message}
                                                onChange={(e) => setMessage(e.target.value)}
                                                rows={4}
                                                className={`w-full rounded-lg border-[#D1D5DB] shadow-sm text-[#1F2937] text-sm resize-none transition-colors
                                                    focus:ring-2 focus:ring-offset-2 ${mode === "thawing"
                                                        ? `focus:border-[${CFA_COLORS.red}] focus:ring-[${CFA_COLORS.red}]`
                                                        : `focus:border-[${themeColors.prep.primary}] focus:ring-[${themeColors.prep.primary}]`}`}
                                                placeholder="Enter your instruction here..."
                                            />
                                        </div>
                                    </div>

                                    {/* Persistent Action Bar */}
                                    <div className="p-4 border-t border-[#E5E7EB] bg-[#F9FAFB]">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2 text-sm text-[#6B7280]">
                                                {selectedDays.length > 0 && (
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {selectedDays.length} day{selectedDays.length !== 1 ? 's' : ''}
                                                    </span>
                                                )}
                                                {selectedProducts.length > 0 && (
                                                    <span className="flex items-center gap-1">
                                                        <Layers className="w-3 h-3" />
                                                        {selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex space-x-3">
                                                {editingInstruction && (
                                                    <button
                                                        onClick={handleCancelEdit}
                                                        className="px-4 py-2 rounded-lg text-[#4B5563] bg-[#F3F4F6] hover:bg-[#E5E7EB] font-medium text-sm transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                )}
                                                <button
                                                    onClick={handleAddOrUpdateInstruction}
                                                    disabled={!message.trim() || selectedDays.length === 0}
                                                    className={`px-6 py-2 rounded-lg text-white font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center
                                                        ${mode === "thawing"
                                                            ? `bg-[${CFA_COLORS.red}] hover:bg-[${CFA_COLORS.darkRed}]`
                                                            : `bg-[${themeColors.prep.primary}] hover:bg-[#236F44]`}`}
                                                    style={{
                                                        backgroundColor: mode === "thawing" ? CFA_COLORS.red : themeColors.prep.primary
                                                    }}
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
                            className="w-6 border-l border-[#E5E7EB] flex items-center justify-center hover:bg-[#F9FAFB]"
                        >
                            {isPanelCollapsed ? (
                                <ChevronRight className="w-4 h-4 text-[#9CA3AF]" />
                            ) : (
                                <ChevronLeft className="w-4 h-4 text-[#9CA3AF]" />
                            )}
                        </button>
                    </motion.div>

                    {/* Right Panel - Instructions List */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex-1 bg-white shadow-md rounded-xl border border-[#E5E7EB] h-[calc(100vh-180px)] sm:h-[calc(100vh-200px)] overflow-hidden"
                    >
                        <div className="p-5 h-full flex flex-col">
                            <div className="flex items-center justify-between mb-5 border-b border-[#E5E7EB] pb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${mode === "thawing" ? "bg-[#FFF1F3]" : "bg-[#F0FAF5]"}`}>
                                        <ListChecks className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-[#1F2937]">
                                        Current Week's Instructions
                                    </h3>
                                </div>
                                <div className="relative">
                                    <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 transform -translate-y-1/2" />
                                    <input
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Search instructions..."
                                        className={`pl-9 pr-4 py-2 rounded-lg border border-[#E5E7EB] text-sm transition-colors
                                            ${mode === "thawing"
                                                ? `focus:border-[${CFA_COLORS.red}] focus:ring-[${CFA_COLORS.red}]`
                                                : `focus:border-[${themeColors.prep.primary}] focus:ring-[${themeColors.prep.primary}]`}`}
                                    />
                                </div>
                            </div>

                            <DragDropContext onDragEnd={handleDragEnd}>
                                <Droppable droppableId="instructions">
                                    {(provided) => (
                                        <ul
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                            className="space-y-3 overflow-y-auto flex-1 pr-1"
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
                                                                            ? `border-[${CFA_COLORS.red}] shadow-lg`
                                                                            : `border-[${themeColors.prep.primary}] shadow-lg`
                                                                        : 'border-[#E5E7EB]'
                                                                        } bg-white hover:shadow-sm transition-all`}
                                                                    style={{
                                                                        borderColor: snapshot.isDragging
                                                                            ? (mode === "thawing" ? CFA_COLORS.red : themeColors.prep.primary)
                                                                            : "#E5E7EB"
                                                                    }}
                                                                >
                                                                    <div className="flex items-start justify-between">
                                                                        <div className="flex-1">
                                                                            <div {...provided.dragHandleProps} className="flex items-center mb-2">
                                                                                <span className={`text-sm font-medium px-3 py-1 rounded-full
                                                                                    ${mode === "thawing"
                                                                                        ? `text-[${CFA_COLORS.red}] bg-[#FFF1F3]`
                                                                                        : `text-[${themeColors.prep.primary}] bg-[#F0FAF5]`}`}
                                                                                    style={{
                                                                                        color: mode === "thawing" ? CFA_COLORS.red : themeColors.prep.primary,
                                                                                        backgroundColor: mode === "thawing" ? "#FFF1F3" : "#F0FAF5"
                                                                                    }}
                                                                                >
                                                                                    {inst.day}
                                                                                </span>
                                                                                <span className="ml-2 text-xs text-[#6B7280] flex items-center">
                                                                                    <Clock className="w-3 h-3 mr-1" />
                                                                                    {new Date().toLocaleDateString()}
                                                                                </span>
                                                                            </div>
                                                                            <p className="text-[#374151] text-sm">
                                                                                {inst.message.startsWith("[PREP]")
                                                                                    ? inst.message.substring(6).trim()
                                                                                    : inst.message}
                                                                            </p>
                                                                            {inst.products && (
                                                                                <div className="mt-2 flex flex-wrap gap-2">
                                                                                    {inst.products.split(",").map((product, idx) => (
                                                                                        <span
                                                                                            key={idx}
                                                                                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium 
                                                                                                ${mode === "thawing"
                                                                                                    ? "bg-[#FFF1F3] text-[#9F1239]"
                                                                                                    : "bg-[#F0FAF5] text-[#166534]"}`}
                                                                                            style={{
                                                                                                backgroundColor: mode === "thawing" ? "#FFF1F3" : "#F0FAF5",
                                                                                                color: mode === "thawing" ? "#9F1239" : "#166534"
                                                                                            }}
                                                                                        >
                                                                                            {product}
                                                                                        </span>
                                                                                    ))}
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                        <div className="flex items-center space-x-1 ml-4">
                                                                            <button
                                                                                onClick={() => handleEditInstruction(inst)}
                                                                                className={`p-1.5 rounded-md text-[#6B7280] transition-colors
                                                                                    ${mode === "thawing"
                                                                                        ? `hover:text-[${CFA_COLORS.red}] hover:bg-[#FFF1F3]`
                                                                                        : `hover:text-[${themeColors.prep.primary}] hover:bg-[#F0FAF5]`}`}
                                                                                style={{
                                                                                    "--hover-color": mode === "thawing" ? CFA_COLORS.red : themeColors.prep.primary,
                                                                                    "--hover-bg": mode === "thawing" ? "#FFF1F3" : "#F0FAF5"
                                                                                }}
                                                                            >
                                                                                <Edit2 className="w-4 h-4" />
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleDeleteInstruction(inst)}
                                                                                className="p-1.5 rounded-md text-[#6B7280] hover:text-[#EF4444] hover:bg-[#FEF2F2] transition-colors"
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
                                                        className="text-center py-12 flex flex-col items-center"
                                                    >
                                                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${mode === "thawing" ? "bg-[#FFF1F3]" : "bg-[#F0FAF5]"}`}
                                                            style={{
                                                                backgroundColor: mode === "thawing" ? "#FFF1F3" : "#F0FAF5"
                                                            }}
                                                        >
                                                            {mode === "thawing"
                                                                ? <RefrigeratorIcon className="w-8 h-8" style={{ color: CFA_COLORS.red }} />
                                                                : <UtensilsCrossed className="w-8 h-8" style={{ color: themeColors.prep.primary }} />
                                                            }
                                                        </div>
                                                        <p className="text-sm text-[#6B7280] mb-2">
                                                            {searchTerm
                                                                ? "No instructions found matching your search"
                                                                : "No instructions added yet"}
                                                        </p>
                                                        <p className="text-xs text-[#9CA3AF]">
                                                            Let's plan your week!
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

                {/* Disabled Product Message Tooltip */}
                <AnimatePresence>
                    {disabledProductMessage && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-3 border border-[#E5E7EB] max-w-xs"
                        >
                            <div className="flex items-center">
                                <AlertCircle className={`h-5 w-5 ${mode === "thawing" ? `text-[${CFA_COLORS.red}]` : `text-[${themeColors.prep.primary}]`} mr-2`}
                                    style={{
                                        color: mode === "thawing" ? CFA_COLORS.red : themeColors.prep.primary
                                    }}
                                />
                                <p className="text-sm text-[#4B5563]">{disabledProductMessage}</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default InstructionManager;
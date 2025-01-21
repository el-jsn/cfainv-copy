import React, { useState, useEffect, useMemo } from "react";
import axiosInstance from "./axiosInstance";
import { Calendar, PlusCircle, Edit2, Trash2, Save, X, AlertCircle } from "lucide-react";
import { set } from "mongoose";

const InstructionManager = () => {
    const [selectedDays, setSelectedDays] = useState([]);
    const [message, setMessage] = useState("");
    const [instructions, setInstructions] = useState([]);
    const [editingInstruction, setEditingInstruction] = useState(null);
    const [error, setError] = useState("");
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [disabledProductMessage, setDisabledProductMessage] = useState(null);

    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const productOptions = ["Filets", "Spicy Filets", "Nuggets", "Spicy Strips", "Grilled Filets", "Grilled Nuggets"];

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
        try {
            for (const day of selectedDays) {
                if (editingInstruction) {
                    await axiosInstance.put(`/messages/${editingInstruction._id}`, { message, products, day });
                    setInstructions(prev =>
                        prev.map(inst => (inst._id === editingInstruction._id && inst.day === day ? { ...inst, message, products } : inst))
                    );
                    setEditingInstruction(null);
                } else {
                    const response = await axiosInstance.post("/messages", { day, message, products });
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
        setMessage(instruction.message);
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

    return (
        <div className="min-h-screen bg-gray-50 font-sans antialiased">
            <div className="max-w-5xl mx-auto py-16 px-6">
                {/* Header */}
                <header className="text-center mb-12">
                    <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
                        Instruction Board
                    </h1>
                    <p className="mt-3 text-gray-500 text-lg">
                        Plan your week with clear and concise instructions.
                    </p>
                </header>

                {/* Error Message */}
                {error && (
                    <div className="rounded-md bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <AlertCircle className="h-5 w-5 text-red-400" />
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">
                                    Error
                                </h3>
                                <div className="mt-2 text-sm text-red-700">
                                    <p>{error}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {/* pop-up message */}
                {disabledProductMessage && (
                    <div className="fixed top-4 right-4 bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded shadow-lg z-50">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <AlertCircle className="h-5 w-5 text-yellow-500" />
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-yellow-800">{disabledProductMessage}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Add/Edit Instruction Form */}
                <div className="bg-white shadow overflow-hidden rounded-xl mb-8 border border-gray-200">
                    <div className="px-8 py-8">
                        <div className="flex items-center mb-8 border-b border-gray-200 pb-4">
                            <Calendar className="w-6 h-6 text-gray-500 mr-3" />
                            <h3 className="text-xl font-semibold text-gray-900">
                                {editingInstruction ? 'Edit Instruction' : 'Add Instruction'}
                            </h3>
                        </div>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            {/* Day of the Week Selector */}
                            <div className="space-y-1">
                                <label htmlFor="day" className="block text-sm font-medium text-gray-700">
                                    Day of the week
                                </label>
                                <div className="mt-1 flex flex-wrap gap-2">
                                    {daysOfWeek.map((day) => (
                                        <button
                                            key={day}
                                            type="button"
                                            onClick={() => handleDaySelect(day)}
                                            className={`rounded-md border-2 text-sm font-medium px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500
                                            ${selectedDays.includes(day)
                                                    ? 'bg-indigo-100 border-indigo-500 text-indigo-700'
                                                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                                }`}
                                        >
                                            {day}
                                        </button>
                                    ))}
                                </div>

                            </div>

                            <div className="space-y-1">
                                <label htmlFor="products" className="block text-sm font-medium text-gray-700">
                                    Products
                                </label>
                                <div className="mt-1 flex flex-wrap gap-2">
                                    {productOptions.map((product) => (
                                        <button
                                            key={product}
                                            type="button"
                                            onClick={() => handleProductSelect(product)}
                                            disabled={disabledProducts.includes(product)}
                                            onMouseEnter={() => handleMouseEnterProduct(product)}
                                            onMouseLeave={handleMouseLeaveProduct}
                                            className={`rounded-md border-2 text-sm font-medium px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500
                                            ${selectedProducts.includes(product)
                                                    ? 'bg-indigo-100 border-indigo-500 text-indigo-700'
                                                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                                } ${disabledProducts.includes(product) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            {product}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Instruction Message */}
                            <div className="space-y-1 col-span-2">
                                <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                                    Instruction Message
                                </label>
                                <textarea
                                    id="message"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    rows={3}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-800 sm:text-sm p-3"
                                    placeholder="Enter your instruction here..."
                                />
                            </div>

                        </div>
                        <div className="mt-8 flex justify-end">
                            {/* Cancel Button (only when editing) */}
                            {editingInstruction && (
                                <button
                                    onClick={handleCancelEdit}
                                    className="mr-3 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    Cancel
                                </button>
                            )}
                            {/* Save/Update Button */}
                            <button
                                onClick={handleAddOrUpdateInstruction}
                                className="inline-flex items-center px-5 py-2.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                {editingInstruction ? <Save className="w-5 h-5 mr-2" /> : <PlusCircle className="w-5 h-5 mr-2" />}
                                {editingInstruction ? 'Update' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Current Week's Instructions */}
                <div className="bg-white shadow overflow-hidden rounded-xl border border-gray-200">
                    <div className="px-8 py-8">
                        <div className="flex items-center mb-8 border-b border-gray-200 pb-4">
                            <h3 className="text-xl font-semibold text-gray-900">
                                Current Week's Instructions
                            </h3>
                        </div>
                        <ul role="list" className="divide-y divide-gray-200">
                            {instructions.length > 0 ? (
                                instructions.map((inst) => (
                                    <li key={inst._id} className="py-5 flex justify-between items-center">
                                        <div className="flex-grow">
                                            <p className="text-base font-semibold text-gray-900">{inst.day}</p>
                                            <p className="mt-1 text-sm text-gray-600">{inst.message}</p>
                                            {inst.products && (
                                                <div className="mt-1">
                                                    <span className="text-sm font-medium text-gray-500 mr-2">Products:</span>
                                                    {inst.products.split(",").map((product, index) => (
                                                        <span
                                                            key={index}
                                                            className="inline-block bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs mr-1"
                                                        >
                                                            {product}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                        </div>
                                        <div className="ml-6 flex items-center space-x-4">
                                            {/* Edit Button */}
                                            <button
                                                onClick={() => handleEditInstruction(inst)}
                                                className="text-indigo-500 hover:text-indigo-700 focus:outline-none"
                                            >
                                                <Edit2 className="w-5 h-5" />
                                            </button>
                                            {/* Delete Button */}
                                            <button
                                                onClick={() => handleDeleteInstruction(inst)}
                                                className="text-gray-500 hover:text-gray-700 focus:outline-none"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </li>
                                ))
                            ) : (
                                // No instructions message
                                <li className="py-8 text-center">
                                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-sm text-gray-500">No instructions added yet. Let's plan your week!</p>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InstructionManager;
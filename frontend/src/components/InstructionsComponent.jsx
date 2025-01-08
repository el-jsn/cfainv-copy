import React, { useState, useEffect } from "react";
import axiosInstance from "./axiosInstance";
import { Calendar, PlusCircle, Edit2, Trash2, Save, X, AlertCircle } from "lucide-react";

const InstructionManager = () => {
    const [day, setDay] = useState("Monday");
    const [message, setMessage] = useState("");
    const [instructions, setInstructions] = useState([]);
    const [editingInstruction, setEditingInstruction] = useState(null);
    const [error, setError] = useState("");

    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

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

        try {
            if (editingInstruction) {
                await axiosInstance.put(`/messages/${editingInstruction.day}`, { day, message });
                setInstructions(prev =>
                    prev.map(inst => (inst.day === editingInstruction.day ? { day, message } : inst))
                );
                setEditingInstruction(null);
            } else {
                await axiosInstance.post("/messages", { day, message });
                setInstructions(prev => [...prev, { day, message }]);
            }
            setMessage("");
            setError("");
        } catch (error) {
            setError(error.response?.data?.message || "Failed to save instruction. Please try again.");
        }
    };

    const handleEditInstruction = (instruction) => {
        setDay(instruction.day);
        setMessage(instruction.message);
        setEditingInstruction(instruction);
    };

    const handleCancelEdit = () => {
        setDay("Monday");
        setMessage("");
        setEditingInstruction(null);
    };

    const handleDeleteInstruction = async (dayToDelete) => {
        try {
            await axiosInstance.delete(`/messages/${dayToDelete}`);
            setInstructions(prev => prev.filter(inst => inst.day !== dayToDelete));
        } catch (error) {
            setError("Failed to delete instruction. Please try again.");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 font-sans antialiased">
            <div className="max-w-5xl mx-auto py-16 px-6">
                <header className="text-center mb-12">
                    <h1 className="text-3xl font-bold text-red-800 tracking-tight">
                        Instructions Board
                    </h1>
                    <p className="mt-3 text-gray-600">
                        Plan your week with clear and concise instructions.
                    </p>
                </header>

                {error && (
                    <div className="rounded-md bg-red-100 border-l-4 border-red-500 p-4 mb-6">
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

                <div className="bg-white shadow-xl overflow-hidden rounded-xl mb-8">
                    <div className="px-8 py-8">
                        <div className="flex items-center mb-8 border-b border-gray-200 pb-4">
                            <Calendar className="w-6 h-6 text-red-500 mr-3" />
                            <h3 className="text-xl font-semibold text-gray-800">
                                {editingInstruction ? 'Edit Instruction' : 'Add Instruction'}
                            </h3>
                        </div>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div>
                                <label htmlFor="day" className="block text-sm font-medium text-gray-700 mb-1">
                                    Day of the week
                                </label>
                                <select
                                    id="day"
                                    value={day}
                                    onChange={(e) => setDay(e.target.value)}
                                    className="mt-1 block w-full rounded-md p-2 border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                                >
                                    {daysOfWeek.map((d) => (
                                        <option key={d} value={d}>
                                            {d}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                                    Instruction Message
                                </label>
                                <textarea
                                    id="message"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    rows={3}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm p-3" // Added p-3 for inner padding
                                    placeholder="Enter your instruction here..."
                                />
                            </div>
                        </div>
                        <div className="mt-8 flex justify-end">
                            {editingInstruction && (
                                <button
                                    onClick={handleCancelEdit}
                                    className="mr-3 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
                                >
                                    Cancel
                                </button>
                            )}
                            <button
                                onClick={handleAddOrUpdateInstruction}
                                className="inline-flex items-center px-5 py-2.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                                {editingInstruction ? <Save className="w-5 h-5 mr-2" /> : <PlusCircle className="w-5 h-5 mr-2" />}
                                {editingInstruction ? 'Update' : 'Save'}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-white shadow-xl overflow-hidden rounded-xl">
                    <div className="px-8 py-8">
                        <div className="flex items-center mb-8 border-b border-gray-200 pb-4">
                            <h3 className="text-xl font-semibold text-gray-800">
                                Current Week's Instructions
                            </h3>
                        </div>
                        <ul role="list" className="divide-y divide-gray-200">
                            {instructions.length > 0 ? (
                                instructions.map((inst) => (
                                    <li key={inst.day} className="py-5 flex justify-between items-center">
                                        <div className="flex-grow">
                                            <p className="text-base font-semibold text-red-800">{inst.day}</p>
                                            <p className="mt-1 text-sm text-gray-600">{inst.message}</p>
                                        </div>
                                        <div className="ml-6 flex items-center space-x-4">
                                            <button
                                                onClick={() => handleEditInstruction(inst)}
                                                className="text-red-500 hover:text-red-700 focus:outline-none"
                                            >
                                                <Edit2 className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteInstruction(inst.day)}
                                                className="text-gray-500 hover:text-gray-700 focus:outline-none"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </li>
                                ))
                            ) : (
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
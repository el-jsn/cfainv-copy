import React, { useState, useEffect } from "react";
import axiosInstance from "./axiosInstance";
import { Calendar, PlusCircle, Edit2, Trash2, Save, X, AlertCircle } from "lucide-react";

const InstructionManager = () => {
    const [day, setDay] = useState("Monday");
    const [message, setMessage] = useState("");
    const [instructions, setInstructions] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [error, setError] = useState("");

    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

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

    const handleAddInstruction = async () => {
        if (!message.trim()) {
            setError("Message cannot be empty!");
            return;
        }

        try {
            const response = await axiosInstance.post("/messages", { day, message });
            setInstructions((prev) =>
                prev.some((inst) => inst.day === day)
                    ? prev.map((inst) => (inst.day === day ? { day, message } : inst))
                    : [...prev, { day, message }]
            );
            setMessage("");
            setIsEditing(false);
            setError("");
        } catch (error) {
            setError(error.response?.data?.message || "Failed to add instruction. Please try again.");
        }
    };

    const handleDeleteInstruction = async (dayToDelete) => {
        try {
            await axiosInstance.delete(`/messages/${dayToDelete}`);
            setInstructions((prev) => prev.filter((inst) => inst.day !== dayToDelete));
        } catch (error) {
            setError("Failed to delete instruction. Please try again.");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
                        Weekday Instructions
                    </h1>
                    <p className="mt-3 text-xl text-gray-600">
                        Manage and organize your daily instructions
                    </p>
                </div>

                {error && (
                    <div className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md flex items-center">
                        <AlertCircle className="w-5 h-5 mr-2" />
                        <p>{error}</p>
                    </div>
                )}

                <div className="bg-white shadow-xl rounded-lg overflow-hidden mb-8">
                    <div className="p-6">
                        <div className="flex items-center mb-4">
                            <Calendar className="w-6 h-6 text-red-500 mr-2" />
                            <label className="block text-gray-700 font-semibold" htmlFor="day">
                                Select Day
                            </label>
                        </div>
                        <select
                            id="day"
                            value={day}
                            onChange={(e) => setDay(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-red-500 focus:border-red-500 p-2.5"
                        >
                            {daysOfWeek.map((d) => (
                                <option key={d} value={d}>
                                    {d}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="p-6 bg-gray-50">
                        <div className="flex items-center mb-4">
                            <Edit2 className="w-6 h-6 text-red-500 mr-2" />
                            <label className="block text-gray-700 font-semibold" htmlFor="message">
                                Instruction
                            </label>
                        </div>
                        <textarea
                            id="message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows="4"
                            className="w-full bg-white border border-gray-300 text-gray-900 rounded-lg focus:ring-red-500 focus:border-red-500 p-2.5"
                            placeholder="Enter your instruction here..."
                        ></textarea>
                    </div>
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                        <button
                            onClick={handleAddInstruction}
                            className="w-full flex justify-center items-center bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105"
                        >
                            {isEditing ? <Save className="w-5 h-5 mr-2" /> : <PlusCircle className="w-5 h-5 mr-2" />}
                            {isEditing ? "Update Instruction" : "Add Instruction"}
                        </button>
                    </div>
                </div>

                <div className="bg-white shadow-xl rounded-lg overflow-hidden">
                    <div className="p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Current Instructions</h2>
                        <div className="space-y-4">
                            {instructions.map((inst) => (
                                <div
                                    key={inst.day}
                                    className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-md transition duration-300 ease-in-out"
                                >
                                    <div className="mb-2 sm:mb-0">
                                        <h3 className="text-lg font-bold text-gray-900">{inst.day}</h3>
                                        <p className="text-gray-600 mt-1">{inst.message}</p>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => {
                                                setDay(inst.day);
                                                setMessage(inst.message);
                                                setIsEditing(true);
                                            }}
                                            className="text-blue-600 hover:text-blue-800 transition duration-300 ease-in-out"
                                        >
                                            <Edit2 className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteInstruction(inst.day)}
                                            className="text-red-600 hover:text-red-800 transition duration-300 ease-in-out"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {instructions.length === 0 && (
                            <div className="text-center py-8">
                                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500 text-lg">No instructions added yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InstructionManager;

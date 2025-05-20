import React from "react";
import {
    Typography,
    Button,
    IconButton,
} from "@material-tailwind/react";
import { Edit2 } from "lucide-react";

// This component renders a single buffer item card.
const BufferItem = ({
    buffer,
    statusClasses,
    editingBuffer,
    handleBufferEdit,
    handleBufferUpdate,
    getBufferColor, // Pass helper functions as props
    getBufferArrow,  // Pass helper functions as props
}) => {
    return (
        <div
            key={buffer._id} // Key is still useful here for React's list rendering
            className={`rounded-xl p-4 border transition-all duration-300 hover:scale-105 hover:shadow-md `}
        >
            <div className="flex justify-between items-start mb-2">
                <Typography variant="h6" className="font-semibold text-[#262626] text-base">
                    {buffer.productName}
                </Typography>
                {editingBuffer === buffer._id ? (
                    <div className="flex items-center space-x-2">
                        <input
                            type="number"
                            defaultValue={buffer.bufferPrcnt}
                            className="w-20 p-1 bg-white border border-gray-200 text-[#262626] rounded-lg focus:ring-2 focus:ring-[#E51636] focus:border-[#E51636]"
                            autoFocus
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    // Find the input value correctly - might need refinement if Button interferes
                                    const inputElement = e.target;
                                    handleBufferUpdate(buffer._id, parseFloat(inputElement.value));
                                }
                            }}
                            // Add an ID to easily grab the value on button click if needed
                            id={`buffer-input-${buffer._id}`}
                        />
                        <Button
                            size="sm"
                            className="bg-[#E51636] hover:bg-[#C41230] text-white px-3 py-1 rounded-lg transition-colors duration-300"
                            onClick={() => {
                                // Find the input associated with this button
                                const inputElement = document.getElementById(`buffer-input-${buffer._id}`);
                                if (inputElement) {
                                    handleBufferUpdate(buffer._id, parseFloat(inputElement.value));
                                }
                            }}
                        >
                            Save
                        </Button>
                    </div>
                ) : (
                    <div className="flex items-center space-x-2">
                        <div className={`flex items-center ${getBufferColor(buffer.bufferPrcnt)} font-bold text-lg`}>
                            {getBufferArrow(buffer.bufferPrcnt)}
                            {buffer.bufferPrcnt}%
                        </div>
                        <IconButton
                            size="sm"
                            className="bg-[#E51636] hover:bg-[#C41230] text-white transition-colors duration-300"
                            onClick={() => handleBufferEdit(buffer._id)}
                        >
                            <Edit2 className="h-4 w-4" />
                        </IconButton>
                    </div>
                )}
            </div>
            <Typography variant="small" className="text-gray-600 mt-2">
                Updated: {new Date(buffer.updatedOn).toLocaleDateString()}
            </Typography>
        </div>
    );
};

export default BufferItem;

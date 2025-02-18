import mongoose from 'mongoose';

const dailyBufferSchema = new mongoose.Schema({
    day: {
        type: String,
        required: true,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    },
    productName: {
        type: String,
        required: true,
        enum: ['Lettuce', 'Tomato', 'Romaine', 'Cobb Salad', 'Southwest Salad']
    },
    bufferPrcnt: {
        type: Number,
        required: true,
        default: 0
    },
    lastModified: {
        type: Date,
        default: Date.now
    }
});

// Compound index to ensure unique combination of day and productName
dailyBufferSchema.index({ day: 1, productName: 1 }, { unique: true });

export default mongoose.model('DailyBuffer', dailyBufferSchema); 
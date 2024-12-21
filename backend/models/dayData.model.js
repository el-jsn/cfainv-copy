import mongoose from 'mongoose';

const dayDataSchema = new mongoose.Schema({
    day: { type: String, required: true },
    message: { type: String, required: true },
    product: { type: String, required: true }, 
    expiresAt: { type: Date, required: true }, // Change to store the actual expiration date
});

dayDataSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const DayData = mongoose.model('DayData', dayDataSchema);
export default DayData;
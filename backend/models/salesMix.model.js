import mongoose from 'mongoose';

const salesMixSchema = new mongoose.Schema({
    data: {
        type: Map,
        of: Number,
        required: true
    },
    uploadDate: {
        type: Date,
        default: Date.now
    },
    reportingPeriod: {
        startDate: {
            type: String,
            required: true
        },
        endDate: {
            type: String,
            required: true
        }
    }
});

// Only keep one document - the latest one
salesMixSchema.pre('save', async function(next) {
    if (this.isNew) {
        await this.constructor.deleteMany({});
    }
    next();
});

const SalesMix = mongoose.model('SalesMix', salesMixSchema);

export default SalesMix; 
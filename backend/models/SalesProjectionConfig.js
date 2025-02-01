import mongoose from 'mongoose';

const salesProjectionConfigSchema = new mongoose.Schema({
    config: {
        type: Map,
        of: {
            type: Map,
            of: Number
        },
        default: new Map()
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update the updatedAt timestamp on save
salesProjectionConfigSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// Convert the config to a plain object when calling toJSON
salesProjectionConfigSchema.set('toJSON', {
    transform: function(doc, ret) {
        if (ret.config instanceof Map) {
            const plainConfig = {};
            // Structure: targetDay -> sourceDay -> percentage
            // This means: targetDay uses sourceDay's data at percentage
            for (const [targetDay, dayConfig] of ret.config.entries()) {
                plainConfig[targetDay] = {};
                if (dayConfig instanceof Map) {
                    for (const [sourceDay, percentage] of dayConfig.entries()) {
                        plainConfig[targetDay][sourceDay] = Number(percentage);
                    }
                }
            }
            ret.config = plainConfig;
        }
        return ret;
    }
});

export default mongoose.model('SalesProjectionConfig', salesProjectionConfigSchema); 
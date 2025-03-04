import mongoose from 'mongoose';

const AssociatedItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    usage: { type: Number, required: true },
    unit: { type: String, required: true } // e.g., 'lb', 'ct'
});

const TruckItemSchema = new mongoose.Schema({
    // Basic Information
    description: { type: String, required: true },
    uom: { type: String, required: true },
    totalUnits: { type: Number, required: true }, // e.g., 10 for "2/5 Lb Ct Case"
    unitType: { type: String, required: true }, // e.g., 'lb', 'ct'
    cost: { type: Number, required: true },
    associatedItems: [AssociatedItemSchema],

    // Inventory Management
    minParLevel: { type: Number, default: null },
    maxParLevel: { type: Number, default: null },
    onHandQty: { type: Number, default: 0 },
    leadTime: { type: Number, default: null }, // in days

    // Storage Information
    storageType: { 
        type: String, 
        enum: ['dry', 'refrigerated', 'frozen'],
        default: 'dry'
    },
    storageLocation: { type: String, default: null },
    shelfLife: { type: Number, default: null }, // in days
    priorityLevel: { 
        type: String,
        enum: ['critical', 'high', 'medium', 'low'],
        default: 'medium'
    },

    // Usage Information
    avgDailyUsage: { type: Number, default: 0 },
    wastePercentage: { type: Number, default: 0 },

    // Metadata
    lastOrderDate: { type: Date, default: null },
    lastOrderQuantity: { type: Number, default: null },
    lastOrderPrice: { type: Number, default: null },
    nextScheduledDelivery: { type: Date, default: null },
    notes: { type: String, default: null }
}, {
    timestamps: true
});

// Add index for faster searches
TruckItemSchema.index({ description: 'text', storageLocation: 'text' });

// Add a method to calculate reorder point
TruckItemSchema.methods.calculateReorderPoint = function() {
    const dailyUsage = this.avgDailyUsage || 0;
    const leadTime = this.leadTime || 1;
    const safetyStock = this.minParLevel || 0;
    
    return (dailyUsage * leadTime) + safetyStock;
};

// Add a method to check if item needs reordering
TruckItemSchema.methods.needsReorder = function() {
    const reorderPoint = this.calculateReorderPoint();
    return this.onHandQty <= reorderPoint;
};

// Add a method to calculate optimal order quantity
TruckItemSchema.methods.calculateOrderQuantity = function() {
    if (!this.maxParLevel) return 0;
    
    const orderQty = this.maxParLevel - (this.onHandQty || 0);
    return Math.max(0, orderQty);
};

const TruckItem = mongoose.model('TruckItem', TruckItemSchema);

export default TruckItem; 
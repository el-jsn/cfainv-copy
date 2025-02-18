import mongoose from 'mongoose';

const AssociatedItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    usage: { type: Number, required: true },
    unit: { type: String, required: true } // e.g., 'lb', 'ct'
});

const TruckItemSchema = new mongoose.Schema({
    description: { type: String, required: true },
    uom: { type: String, required: true },
    totalUnits: { type: Number, required: true }, // e.g., 10 for "2/5 Lb Ct Case"
    unitType: { type: String, required: true }, // e.g., 'lb', 'ct'
    cost: { type: Number, required: true },
    associatedItems: [AssociatedItemSchema],
}, {
    timestamps: true
});

const TruckItem = mongoose.model('TruckItem', TruckItemSchema);

export default TruckItem; 
import express from 'express';
import TruckItem from '../models/truckItem.model.js';

const router = express.Router();

// Get all truck items
router.get('/', async (req, res) => {
    try {
        const truckItems = await TruckItem.find();
        res.json(truckItems);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get items that need reordering
router.get('/reorder-needed', async (req, res) => {
    try {
        const allItems = await TruckItem.find();
        const itemsNeedingReorder = allItems.filter(item => item.needsReorder());
        
        const reorderList = itemsNeedingReorder.map(item => ({
            _id: item._id,
            description: item.description,
            currentStock: item.onHandQty,
            reorderPoint: item.calculateReorderPoint(),
            suggestedOrderQty: item.calculateOrderQuantity(),
            priorityLevel: item.priorityLevel
        }));

        res.json(reorderList);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get items by storage type
router.get('/storage/:type', async (req, res) => {
    try {
        const items = await TruckItem.find({ storageType: req.params.type });
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get items expiring soon (within next 7 days)
router.get('/expiring-soon', async (req, res) => {
    try {
        const items = await TruckItem.find({
            shelfLife: { $ne: null },
            onHandQty: { $gt: 0 }
        });

        const expiringItems = items.filter(item => {
            if (!item.lastOrderDate || !item.shelfLife) return false;
            
            const expirationDate = new Date(item.lastOrderDate);
            expirationDate.setDate(expirationDate.getDate() + item.shelfLife);
            
            const sevenDaysFromNow = new Date();
            sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
            
            return expirationDate <= sevenDaysFromNow;
        });

        res.json(expiringItems);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new truck item
router.post('/', async (req, res) => {
    const truckItem = new TruckItem({
        // Basic Information
        description: req.body.description,
        uom: req.body.uom,
        totalUnits: req.body.totalUnits,
        unitType: req.body.unitType,
        cost: req.body.cost,
        associatedItems: req.body.associatedItems || [],

        // Inventory Management
        minParLevel: req.body.minParLevel,
        maxParLevel: req.body.maxParLevel,
        onHandQty: req.body.onHandQty,
        leadTime: req.body.leadTime,

        // Storage Information
        storageType: req.body.storageType,
        storageLocation: req.body.storageLocation,
        shelfLife: req.body.shelfLife,
        priorityLevel: req.body.priorityLevel,

        // Usage Information
        avgDailyUsage: req.body.avgDailyUsage,
        wastePercentage: req.body.wastePercentage,

        // Metadata
        notes: req.body.notes
    });

    try {
        const newTruckItem = await truckItem.save();
        res.status(201).json(newTruckItem);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update a truck item
router.put('/:id', async (req, res) => {
    try {
        const truckItem = await TruckItem.findById(req.params.id);
        if (!truckItem) {
            return res.status(404).json({ message: 'Truck item not found' });
        }

        // Basic Information
        if (req.body.description) truckItem.description = req.body.description;
        if (req.body.uom) truckItem.uom = req.body.uom;
        if (req.body.totalUnits) truckItem.totalUnits = req.body.totalUnits;
        if (req.body.unitType) truckItem.unitType = req.body.unitType;
        if (req.body.cost) truckItem.cost = req.body.cost;
        if (req.body.associatedItems) truckItem.associatedItems = req.body.associatedItems;

        // Inventory Management
        if (req.body.minParLevel !== undefined) truckItem.minParLevel = req.body.minParLevel;
        if (req.body.maxParLevel !== undefined) truckItem.maxParLevel = req.body.maxParLevel;
        if (req.body.onHandQty !== undefined) truckItem.onHandQty = req.body.onHandQty;
        if (req.body.leadTime !== undefined) truckItem.leadTime = req.body.leadTime;

        // Storage Information
        if (req.body.storageType) truckItem.storageType = req.body.storageType;
        if (req.body.storageLocation !== undefined) truckItem.storageLocation = req.body.storageLocation;
        if (req.body.shelfLife !== undefined) truckItem.shelfLife = req.body.shelfLife;
        if (req.body.priorityLevel) truckItem.priorityLevel = req.body.priorityLevel;

        // Usage Information
        if (req.body.avgDailyUsage !== undefined) truckItem.avgDailyUsage = req.body.avgDailyUsage;
        if (req.body.wastePercentage !== undefined) truckItem.wastePercentage = req.body.wastePercentage;

        // Metadata
        if (req.body.notes !== undefined) truckItem.notes = req.body.notes;
        if (req.body.lastOrderDate) truckItem.lastOrderDate = req.body.lastOrderDate;
        if (req.body.lastOrderQuantity !== undefined) truckItem.lastOrderQuantity = req.body.lastOrderQuantity;
        if (req.body.lastOrderPrice !== undefined) truckItem.lastOrderPrice = req.body.lastOrderPrice;
        if (req.body.nextScheduledDelivery) truckItem.nextScheduledDelivery = req.body.nextScheduledDelivery;

        const updatedTruckItem = await truckItem.save();
        res.json(updatedTruckItem);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update inventory quantity
router.patch('/:id/inventory', async (req, res) => {
    try {
        const truckItem = await TruckItem.findById(req.params.id);
        if (!truckItem) {
            return res.status(404).json({ message: 'Truck item not found' });
        }

        const { adjustment, type } = req.body; // type can be 'add' or 'subtract'
        
        if (type === 'subtract' && truckItem.onHandQty < adjustment) {
            return res.status(400).json({ message: 'Insufficient inventory' });
        }

        truckItem.onHandQty = type === 'add' 
            ? (truckItem.onHandQty || 0) + adjustment
            : (truckItem.onHandQty || 0) - adjustment;

        const updatedTruckItem = await truckItem.save();
        res.json(updatedTruckItem);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Record a new order
router.post('/:id/order', async (req, res) => {
    try {
        const truckItem = await TruckItem.findById(req.params.id);
        if (!truckItem) {
            return res.status(404).json({ message: 'Truck item not found' });
        }

        const { quantity, price, deliveryDate } = req.body;

        truckItem.lastOrderDate = new Date();
        truckItem.lastOrderQuantity = quantity;
        truckItem.lastOrderPrice = price;
        truckItem.nextScheduledDelivery = deliveryDate;

        const updatedTruckItem = await truckItem.save();
        res.json(updatedTruckItem);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete a truck item
router.delete('/:id', async (req, res) => {
    try {
        const truckItem = await TruckItem.findById(req.params.id);
        if (!truckItem) {
            return res.status(404).json({ message: 'Truck item not found' });
        }
        await truckItem.deleteOne();
        res.json({ message: 'Truck item deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router; 
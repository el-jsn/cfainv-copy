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

// Create a new truck item
router.post('/', async (req, res) => {
    const truckItem = new TruckItem({
        description: req.body.description,
        uom: req.body.uom,
        totalUnits: req.body.totalUnits,
        unitType: req.body.unitType,
        cost: req.body.cost,
        associatedItems: req.body.associatedItems || []
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

        if (req.body.description) truckItem.description = req.body.description;
        if (req.body.uom) truckItem.uom = req.body.uom;
        if (req.body.totalUnits) truckItem.totalUnits = req.body.totalUnits;
        if (req.body.unitType) truckItem.unitType = req.body.unitType;
        if (req.body.cost) truckItem.cost = req.body.cost;
        if (req.body.associatedItems) truckItem.associatedItems = req.body.associatedItems;

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
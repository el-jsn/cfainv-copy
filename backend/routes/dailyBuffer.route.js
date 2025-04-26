import { Router } from 'express';
import DailyBuffer from '../models/dailyBuffer.model.js';
import { authenticateToken } from '../middlewares/userAuth.js';
import { adminAuth } from '../middlewares/adminAuth.js';

const router = Router();

// Get all daily buffers
router.get('/', authenticateToken, async (req, res) => {
    try {
        const dailyBuffers = await DailyBuffer.find();
        res.json(dailyBuffers);
    } catch (err) {
        res.status(400).json('Error: ' + err);
    }
});

// Get buffers for a specific day
router.get('/:day', authenticateToken, async (req, res) => {
    try {
        const dailyBuffers = await DailyBuffer.find({ day: req.params.day });
        res.json(dailyBuffers);
    } catch (err) {
        res.status(400).json('Error: ' + err);
    }
});

// Add or update daily buffer (admin only)
router.post('/', authenticateToken, adminAuth, async (req, res) => {
    try {
        // Check if the request body is an array
        if (Array.isArray(req.body)) {
            const results = [];

            // Process each buffer in the array
            for (const buffer of req.body) {
                const { day, productName, bufferPrcnt } = buffer;

                const update = {
                    day,
                    productName,
                    bufferPrcnt,
                    lastModified: new Date()
                };

                const dailyBuffer = await DailyBuffer.findOneAndUpdate(
                    { day, productName },
                    update,
                    { upsert: true, new: true }
                );

                results.push(dailyBuffer);
            }

            res.json(results);
        } else {
            // Handle single object case for backward compatibility
            const { day, productName, bufferPrcnt } = req.body;

            const update = {
                day,
                productName,
                bufferPrcnt,
                lastModified: new Date()
            };

            const dailyBuffer = await DailyBuffer.findOneAndUpdate(
                { day, productName },
                update,
                { upsert: true, new: true }
            );

            res.json(dailyBuffer);
        }
    } catch (err) {
        res.status(400).json('Error: ' + err);
    }
});

// Delete daily buffer (admin only)
router.delete('/:id', authenticateToken, adminAuth, async (req, res) => {
    try {
        await DailyBuffer.findByIdAndDelete(req.params.id);
        res.json('Daily buffer deleted.');
    } catch (err) {
        res.status(400).json('Error: ' + err);
    }
});

export default router;
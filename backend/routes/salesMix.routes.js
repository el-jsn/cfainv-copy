import express from 'express';
import SalesMix from '../models/salesMix.model.js';
import { authenticateToken } from '../middlewares/userAuth.js';

const router = express.Router();

// Upload new sales mix data
router.post('/upload', authenticateToken, async (req, res) => {
    try {
        const { data, reportingPeriod } = req.body;
        
        if (!data || !reportingPeriod || !reportingPeriod.startDate || !reportingPeriod.endDate) {
            return res.status(400).json({ message: 'Missing required data' });
        }

        const salesMix = new SalesMix({
            data: data,
            reportingPeriod: {
                startDate: reportingPeriod.startDate,
                endDate: reportingPeriod.endDate
            }
        });

        await salesMix.save();
        res.status(200).json({ 
            message: 'Sales mix data uploaded successfully',
            uploadDate: salesMix.uploadDate,
            reportingPeriod: salesMix.reportingPeriod
        });
    } catch (error) {
        console.error('Error uploading sales mix:', error);
        res.status(500).json({ message: 'Error uploading sales mix data' });
    }
});

// Get current sales mix data
router.get('/current', authenticateToken, async (req, res) => {
    try {
        const currentSalesMix = await SalesMix.findOne().sort({ uploadDate: -1 });
        
        if (!currentSalesMix) {
            return res.status(404).json({ message: 'No sales mix data found' });
        }

        res.status(200).json({
            data: currentSalesMix.data,
            uploadDate: currentSalesMix.uploadDate,
            reportingPeriod: currentSalesMix.reportingPeriod
        });
    } catch (error) {
        console.error('Error fetching sales mix:', error);
        res.status(500).json({ message: 'Error fetching sales mix data' });
    }
});

export default router; 
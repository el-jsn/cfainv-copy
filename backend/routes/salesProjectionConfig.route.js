import express from 'express';
import { authenticateToken } from '../middlewares/userAuth.js';
import SalesProjectionConfig from '../models/SalesProjectionConfig.js';

const router = express.Router();

// Get sales projection configuration
router.get('/sales-projection-config', authenticateToken, async (req, res) => {
    try {
        let config = await SalesProjectionConfig.findOne();
        
        if (!config) {
            // Return default configuration if none exists
            const defaultConfig = {
                "Monday": { "Tuesday": 0, "Wednesday": 100, "Thursday": 0, "Friday": 0, "Saturday": 0 },
                "Tuesday": { "Monday": 0, "Wednesday": 100, "Thursday": 0, "Friday": 0, "Saturday": 0 },
                "Wednesday": { "Monday": 0, "Tuesday": 0, "Thursday": 100, "Friday": 0, "Saturday": 0 },
                "Thursday": { "Monday": 0, "Tuesday": 0, "Wednesday": 0, "Friday": 100, "Saturday": 0 },
                "Friday": { "Monday": 0, "Tuesday": 0, "Wednesday": 0, "Thursday": 0, "Saturday": 100 },
                "Saturday": { "Monday": 100, "Tuesday": 0, "Wednesday": 0, "Thursday": 0, "Friday": 0 }
            };
            return res.json(defaultConfig);
        }

        // Convert Mongoose Map to plain object
        const configObject = {};
        for (const [day, dayConfig] of config.config.entries()) {
            configObject[day] = {};
            for (const [sourceDay, percentage] of dayConfig.entries()) {
                configObject[day][sourceDay] = Number(percentage.$numberInt || percentage);
            }
        }

        res.json(configObject);
    } catch (error) {
        console.error('Error fetching sales projection config:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update sales projection configuration
router.post('/sales-projection-config', authenticateToken, async (req, res) => {
    try {
        const configData = req.body;
        
        // Validate the configuration
        const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        for (const day of days) {
            if (!configData[day]) {
                configData[day] = {}; // Initialize empty object if missing
                continue;
            }
            
            const dayTotal = Object.values(configData[day])
                .reduce((sum, val) => sum + Number(val), 0);
            
           
        }

        // Update or create the configuration
        let config = await SalesProjectionConfig.findOne();
        
        if (config) {
            config.config = configData;
            await config.save();
        } else {
            config = new SalesProjectionConfig({
                config: configData
            });
            await config.save();
        }

        res.json({ message: 'Configuration saved successfully' });
    } catch (error) {
        console.error('Error saving sales projection config:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router; 
import express from 'express';
import { createDayData, getAllDayData, deleteDayData } from '../controllers/dayData.controller.js';
import { isAdmin } from '../middlewares/userAuth.js';

const router = express.Router();

// Route to create a new record
router.post('/data', isAdmin, createDayData);

// Route to fetch all records
router.get('/data', getAllDayData);

// Route to delete a specific record by ID (optional for testing)
router.delete('/data/:id',isAdmin, deleteDayData);

export default router;
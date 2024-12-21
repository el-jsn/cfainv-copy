import express from 'express';

const router = express.Router();

import { submitClosurePlan, getAllClosurePlans, deleteClosurePlan } from '../controllers/closure.controller.js';

router.post('/plan', submitClosurePlan);
router.get('/plans', getAllClosurePlans);
router.delete('/plan/:id', deleteClosurePlan);



export default router;

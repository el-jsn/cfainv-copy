import express from 'express';

const router = express.Router();

import { submitClosurePlan, getAllClosurePlans, deleteClosurePlan } from '../controllers/closure.controller.js';
import { isAdmin } from '../middlewares/userAuth.js';

router.post('/plan',isAdmin, submitClosurePlan);
router.get('/plans', getAllClosurePlans);
router.delete('/plan/:id', isAdmin, deleteClosurePlan);



export default router;

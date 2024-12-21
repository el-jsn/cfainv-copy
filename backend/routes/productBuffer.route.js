import express from 'express';
import { getAllBuffers, addProductBuffer, getBufferById, updateBufferById } from '../controllers/productBuffer.controller.js';

const router = express.Router();

// Get all product buffers
router.get('/', getAllBuffers);

// Add a new product buffer
router.post('/', addProductBuffer);

// Get a single product buffer by ID
router.get('/:id', getBufferById);

// Update a product buffer by ID
router.put('/:id', updateBufferById);

export default router;

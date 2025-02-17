import express from 'express';
import { getAllBuffers, addProductBuffer, getBufferById, updateBufferById } from '../controllers/productBuffer.controller.js';
import ProductBuffer from '../models/productBuffer.model.js';

const router = express.Router();

// Get all product buffers
router.get('/', getAllBuffers);

// Add a new product buffer
router.post('/', addProductBuffer);

// Get a single product buffer by ID
router.get('/:id', getBufferById);

// Update a product buffer by ID
router.put('/:id', updateBufferById);

router.get("/", async (req, res) => {
  try {
    const products = await ProductBuffer.find({});
    
    // Calculate trends for each product
    const productsWithTrends = products.map(product => {
      const history = product.history || [];
      let trend = 'none';
      let change = 0;

      if (history.length >= 2) {
        const currentUTP = product.utp;
        const previousUTP = history[history.length - 2].utp;
        
        change = ((currentUTP - previousUTP) / previousUTP * 100).toFixed(1);
        trend = change > 0 ? 'up' : change < 0 ? 'down' : 'none';
      }

      return {
        ...product.toObject(),
        trend,
        change: Math.abs(change)
      };
    });

    res.json(productsWithTrends);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

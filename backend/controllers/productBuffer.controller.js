import ProductBuffer from '../models/productBuffer.model.js';

export const getAllBuffers = async (req, res) => {
  try {
    const buffers = await ProductBuffer.find();
    res.status(200).json(buffers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add a new product buffer
export const addProductBuffer = async (req, res) => {
    try {
      const { productName, bufferPrcnt } = req.body;
  
      // Validate input
      if (!productName || bufferPrcnt == null) {
        return res.status(400).json({ message: 'Product name and buffer percentage are required' });
      }
  
      const newBuffer = new ProductBuffer({
        productName,
        bufferPrcnt,
      });
  
      const savedBuffer = await newBuffer.save();
      res.status(201).json(savedBuffer);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  

export const getBufferById = async (req, res) => {
  try {
    const { id } = req.params;
    const buffer = await ProductBuffer.findById(id);
    if (!buffer) {
      return res.status(404).json({ message: 'Buffer not found' });
    }
    res.status(200).json(buffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateBufferById = async (req, res) => {
  try {
    const { id } = req.params;
    const { productName, bufferPrcnt } = req.body;

    const updatedBuffer = await ProductBuffer.findByIdAndUpdate(
      id,
      { productName, bufferPrcnt, updatedOn: new Date() },
      { new: true } // Return the updated document
    );

    if (!updatedBuffer) {
      return res.status(404).json({ message: 'Buffer not found' });
    }

    res.status(200).json(updatedBuffer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

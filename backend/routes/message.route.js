// routes/messages.js
import express from 'express';
import Message from '../models/message.model.js';

const router = express.Router();

// Get messages for all weekdays
router.get('/', async (req, res) => {
  try {
    const messages = await Message.find();
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching messages' });
  }
});

// Add or update a message for a specific weekday
router.post('/', async (req, res) => {
  const { day, message } = req.body;

  if (!day || !message) {
    return res.status(400).json({ error: 'Day and message are required' });
  }

  try {
    let existingMessage = await Message.findOne({ day });
    if (existingMessage) {
      existingMessage.message = message;
      await existingMessage.save();
    } else {
      const newMessage = new Message({ day, message });
      await newMessage.save();
    }
    res.json({ message: 'Message added/updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error adding/updating message' });
  }
});

// Delete a message for a specific weekday
router.delete('/:day', async (req, res) => {
  try {
    await Message.deleteOne({ day: req.params.day });
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting message' });
  }
});

export default router;

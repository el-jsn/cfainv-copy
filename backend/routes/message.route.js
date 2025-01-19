// routes/messages.js
import express from 'express';
import Message from '../models/message.model.js';

const router = express.Router();


    // Get all messages
    router.get('/', async (req, res) => {
      try {
        const messages = await Message.find();
        res.json(messages);
      } catch (error) {
        res.status(500).json({ error: 'Error fetching messages' });
      }
    });

    // Create a new message
    router.post('/', async (req, res) => {
        const { day, message, products } = req.body;

        if (!day || !message) {
            return res.status(400).json({ error: "day and message are required" });
        }

      try {
        const newMessage = new Message({ day, message, products });
        const savedMessage = await newMessage.save();
        res.status(201).json(savedMessage);
      } catch (error) {
        res.status(500).json({ error: 'Error creating message', details: error });
      }
    });

    // Update a message
    router.put('/:day', async (req, res) => {
      const { day } = req.params;
      const { message, products } = req.body;
      if (!day || !message) {
          return res.status(400).json({ error: 'Day and message are required for update' });
      }

      try {
          const updatedMessage = await Message.findOneAndUpdate({day}, { message, products }, {new: true});
          if (!updatedMessage){
              return res.status(404).json({ message: 'Message not found' })
          }
          res.json(updatedMessage);
      } catch (error) {
        res.status(500).json({ error: 'Error updating message' });
      }
    });


    // Delete a message using _id
    router.delete('/:id', async (req, res) => {
        const { id } = req.params;
        try {
        const deletedMessage = await Message.findByIdAndDelete(id);
            if (!deletedMessage){
                return res.status(404).json({ message: 'Message not found' });
            }
          res.json({ message: 'Message deleted successfully' });
        } catch (error) {
          res.status(500).json({ error: 'Error deleting message' });
        }
      });



export default router;

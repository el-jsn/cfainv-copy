import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  day: {
    type: String,
    required: true,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], // Weekdays
  },
  message: {
    type: String,
    required: true,
  },
  products: {
    type: String,
    default: '',
  },
});

const Message = mongoose.model('Message', messageSchema);
export default Message;

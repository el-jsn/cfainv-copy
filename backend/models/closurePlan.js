import mongoose from "mongoose";

const closurePlanSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  duration: {
    value: {
      type: Number,
      required: true
    },
    unit: {
      type: String,
      enum: ['days', 'weeks'],
      required: true
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const closurePlan = mongoose.model('ClosurePlan', closurePlanSchema);


export default closurePlan;

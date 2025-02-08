import mongoose from "mongoose";

const FutureProjectionSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true,
    index: true
  },
  amount: {
    type: Number,
    required: true
  },
  appliedToWeek: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

const FutureProjection = mongoose.model("FutureProjection", FutureProjectionSchema);

export default FutureProjection; 
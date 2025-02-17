import mongoose from 'mongoose';

const productBufferSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: true,
      unique: true
    },
    utp: {
      type: Number,
      required: true
    },
    bufferPrcnt: {
      type: Number,
      required: true,
    },
    history: [{
      utp: Number,
      date: {
        type: Date,
        default: Date.now
      }
    }],
    updatedOn: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true } // Adds createdAt and updatedAt fields
);

// Add pre-save middleware to track history
productBufferSchema.pre('save', function(next) {
  if (this.isModified('utp')) {
    this.history.push({
      utp: this.utp,
      date: new Date()
    });
  }
  next();
});

const ProductBuffer = mongoose.model('ProductBuffer', productBufferSchema);

export default ProductBuffer;

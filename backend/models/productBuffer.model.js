import mongoose from 'mongoose';

const productBufferSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: true,
    },
    bufferPrcnt: {
      type: Number,
      required: true,
    },
    updatedOn: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true } // Adds createdAt and updatedAt fields
);

const ProductBuffer = mongoose.model('ProductBuffer', productBufferSchema);

export default ProductBuffer;

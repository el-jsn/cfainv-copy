import mongoose from "mongoose";

const SalesDataSchema = new mongoose.Schema({
    productName: String,
    utp: Number,
  });
  
  
const SalesData = mongoose.model("SalesData", SalesDataSchema);

export default SalesData;
  
import mongoose from "mongoose";

const ProjectedSalesSchema = new mongoose.Schema({
  day: String,
  sales: Number,
}, { timestamps: { updatedAt: 'updated_on' } });

const ProjectedSales = mongoose.model("ProjectedSales", ProjectedSalesSchema);

export default ProjectedSales;
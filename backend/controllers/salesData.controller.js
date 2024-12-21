import SalesData from "../models/SalesData.model.js";

// Bulk Create or Update Sales Data
export const bulkCreateOrUpdateSalesData = async (req, res) => {
  const salesData = req.body;

  try {
    const updates = Object.entries(salesData).map(async ([productName, utp]) => {
      return SalesData.findOneAndUpdate(
        { productName}, // Match by productName
        { utp}, // Update UTP
        { upsert: true, new: true } // Create if not exists, return updated document
      );
    });

    const results = await Promise.all(updates); // Wait for all updates
    res.status(200).json({ message: "Sales data updated successfully", data: results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get All Sales Data
export const getAllSalesData = async (req, res) => {
  try {
    const salesData = await SalesData.find({});
    res.status(200).json(salesData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

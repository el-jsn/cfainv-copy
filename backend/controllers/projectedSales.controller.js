import ProjectedSales from "../models/ProjectedSales.model.js";

// Bulk Create or Update Sales
export const bulkCreateOrUpdateSales = async (req, res) => {
  const salesData = req.body; // e.g., { Monday: 15000, Tuesday: 15000, ... }

  try {
    const updates = Object.entries(salesData).map(async ([day, sales]) => {
      return ProjectedSales.findOneAndUpdate(
        { day }, // Match by day
        { sales }, // Update sales value
        { upsert: true, new: true } // Create if not exists, return the updated document
      );
    });

    const results = await Promise.all(updates); // Wait for all updates
    res.status(200).json({ message: "Sales data updated successfully", data: results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get All Sales
export const getAllSales = async (req, res) => {
  try {
    const sales = await ProjectedSales.find({});
    res.status(200).json(sales);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Sales by Day
export const updateSalesByDay = async (req, res) => {
  const { day } = req.params;
  const { sales } = req.body;

  try {
    const updatedSales = await ProjectedSales.findOneAndUpdate(
      { day }, // Match by day
      { sales }, // Update sales value
      { new: true } // Return updated document
    );

    if (!updatedSales) {
      return res.status(404).json({ message: `Sales data for ${day} not found.` });
    }

    res.status(200).json({ message: "Sales data updated successfully", data: updatedSales });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

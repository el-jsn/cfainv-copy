import FutureProjection from "../models/FutureProjection.model.js";
import ProjectedSales from "../models/ProjectedSales.model.js";

// Get all future projections
export const getAllFutureProjections = async (req, res) => {
  try {
    const projections = await FutureProjection.find()
      .sort({ date: 1 });
    
    if (!projections) {
      return res.status(200).json([]); // Return empty array if no projections
    }
    
    // Convert dates to local time before sending
    const formattedProjections = projections.map(proj => ({
      ...proj.toObject(),
      date: new Date(proj.date.getTime() + proj.date.getTimezoneOffset() * 60000)
    }));
    
    res.status(200).json(formattedProjections);
  } catch (error) {
    console.error("Error in getAllFutureProjections:", error);
    res.status(500).json({ 
      error: "Failed to fetch projections",
      details: error.message 
    });
  }
};

// Add or update a future projection
export const addFutureProjection = async (req, res) => {
  try {
    const { date, amount } = req.body;
    
    if (!date || amount === undefined) {
      return res.status(400).json({ 
        error: "Date and amount are required" 
      });
    }

    // Create date objects for start and end of day
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    // First try to find and delete any existing projection for this date
    await FutureProjection.deleteOne({ 
      date: {
        $gte: startOfDay,
        $lt: endOfDay
      }
    });

    // Create new projection with noon UTC time
    const projectionDate = new Date(date);
    projectionDate.setUTCHours(12, 0, 0, 0);

    const projection = new FutureProjection({
      date: projectionDate,
      amount,
      appliedToWeek: false
    });

    await projection.save();
    
    res.status(200).json(projection);
  } catch (error) {
    console.error("Error in addFutureProjection:", error);
    res.status(500).json({ 
      error: "Failed to add/update projection",
      details: error.message 
    });
  }
};

// Delete a future projection
export const deleteFutureProjection = async (req, res) => {
  try {
    const { date } = req.params;

    // Create date objects for start and end of day
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    // Find and delete any projection within this date range
    const deleted = await FutureProjection.findOneAndDelete({ 
      date: {
        $gte: startOfDay,
        $lt: endOfDay
      }
    });

    if (!deleted) {
      return res.status(404).json({ message: "Projection not found" });
    }

    res.status(200).json({ message: "Projection deleted successfully" });
  } catch (error) {
    console.error("Error in deleteFutureProjection:", error);
    res.status(500).json({ 
      error: "Failed to delete projection",
      details: error.message 
    });
  }
};

// Apply future projections to weekly projections (runs every Saturday night)
export const applyFutureProjections = async () => {
  // ... entire function can be removed
}; 
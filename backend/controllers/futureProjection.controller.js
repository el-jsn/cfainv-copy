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
  try {
    // Get current date in Eastern Time (ET)
    const today = new Date();
    // Convert to Toronto timezone
    const etDate = new Date(today.toLocaleString('en-US', { timeZone: 'America/Toronto' }));
    
    // Get the start (Sunday) and end (Saturday) of the next week
    const startOfNextWeek = new Date(etDate);
    startOfNextWeek.setDate(etDate.getDate() + 1); // Next day (Sunday)
    startOfNextWeek.setHours(0, 0, 0, 0);
    
    const endOfNextWeek = new Date(startOfNextWeek);
    endOfNextWeek.setDate(startOfNextWeek.getDate() + 6);
    endOfNextWeek.setHours(23, 59, 59, 999);

    console.log('Checking projections for next week:', {
      startOfNextWeek,
      endOfNextWeek
    });

    // Find all future projections for next week that haven't been applied
    const weeklyProjections = await FutureProjection.find({
      date: {
        $gte: startOfNextWeek,
        $lte: endOfNextWeek
      },
      appliedToWeek: false
    });

    console.log(`Found ${weeklyProjections.length} projections to apply`);

    // Apply each projection to the corresponding day
    for (const projection of weeklyProjections) {
      const projDate = new Date(projection.date);
      const dayOfWeek = projDate.getDay();
      const dayName = [
        'Sunday', 'Monday', 'Tuesday', 'Wednesday', 
        'Thursday', 'Friday', 'Saturday'
      ][dayOfWeek];

      console.log(`Applying projection for ${dayName}:`, {
        date: projDate,
        amount: projection.amount
      });

      // Update weekly projection
      await ProjectedSales.findOneAndUpdate(
        { day: dayName },
        { sales: projection.amount },
        { upsert: true }
      );

      // Mark projection as applied but don't delete it
      projection.appliedToWeek = true;
      await projection.save();
    }

    console.log(`Successfully applied ${weeklyProjections.length} future projections to weekly sales`);
  } catch (error) {
    console.error('Error applying future projections:', error);
  }
}; 
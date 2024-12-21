import DayData from '../models/dayData.model.js';


// Create a new record
export const createDayData = async (req, res) => {
    try {
        const { day, message, product, durationInSeconds } = req.body;

        // Validate input
        if (!day || !message || !product || !durationInSeconds) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Calculate expiration date
        const expiresAt = new Date();
        expiresAt.setSeconds(expiresAt.getSeconds() + parseInt(durationInSeconds, 10));

        // Save the data
        const newDayData = new DayData({
            day,
            message,
            product,
            expiresAt, // Use the calculated expiration date
        });

        await newDayData.save();
        res.status(201).json(newDayData);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create data', details: error.message });
    }
};
 // Fetch all non-expired records
export const getAllDayData = async (req, res) => {
    try {
        const currentDate = new Date();
        const data = await DayData.find({ expiresAt: { $gt: currentDate } });
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch data', details: error.message });
    }
};
  
  // Delete a record manually (optional for testing)
  export const deleteDayData = async (req, res) => {
    try {
      const { id } = req.params;
  
      const deletedData = await DayData.findByIdAndDelete(id);
      if (!deletedData) {
        return res.status(404).json({ error: 'Data not found' });
      }
  
      res.status(200).json({ message: 'Data deleted successfully', deletedData });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete data', details: error.message });
    }
  };

  export const cleanupExpiredRecords = async () => {
    try {
        const currentDate = new Date();
        const result = await DayData.deleteMany({ expiresAt: { $lte: currentDate } });
        console.log(`Cleaned up ${result.deletedCount} expired records`);
    } catch (error) {
        console.error('Failed to clean up expired records:', error);
    }
};
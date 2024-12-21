import closurePlan from '../models/closurePlan.js';

export const submitClosurePlan = async (req, res) => {
  try {
    const { date, reason, duration } = req.body;

    const newClosurePlan = new closurePlan({
      date,
      reason,
      duration
    });

    await newClosurePlan.save();

    res.status(201).json({ message: 'Closure plan submitted successfully', plan: newClosurePlan });
  } catch (error) {
    console.error('Error submitting closure plan:', error);
    res.status(500).json({ message: 'Error submitting closure plan', error: error.message });
  }
};

export const getAllClosurePlans = async (req, res) => {
    try {
      const closurePlans = await closurePlan.find().sort({ date: 1 });
      res.status(200).json(closurePlans);
    } catch (error) {
      console.error('Error fetching closure plans:', error);
      res.status(500).json({ message: 'Error fetching closure plans', error: error.message });
    }
  };

  export const deleteClosurePlan = async (req, res) => {
    try {
      const { id } = req.params;
      const deletedPlan = await closurePlan.findByIdAndDelete(id);
      
      if (!deletedPlan) {
        return res.status(404).json({ message: 'Closure plan not found' });
      }
  
      res.status(200).json({ message: 'Closure plan deleted successfully' });
    } catch (error) {
      console.error('Error deleting closure plan:', error);
      res.status(500).json({ message: 'Error deleting closure plan', error: error.message });
    }
  };

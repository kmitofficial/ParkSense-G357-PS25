import express from "express"
import Feedback from "../models/Feedback.js"

const router = express.Router();

router.post('/', async (req, res) => {
    try {
      const { plateNumber, phoneNumber, rating, comment } = req.body;
  
      if (!rating || rating < 1 || rating > 5 || plateNumber === null || phoneNumber === null) {
        return res.status(400).json({ error: 'Valid rating (1-5) is required' });
      }
  
      const feedback = new Feedback({
        plateNumber,
        phoneNumber,
        rating,
        comment
      });
  
      await feedback.save();
  
      res.status(201).json({ message: 'Feedback submitted successfully' });
    } catch (error) {
      console.error('Error saving feedback:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  router.get('/get', async (req, res) => {
    try {
      const feedbacks = await Feedback.find().sort({ createdAt: -1 });
      res.status(200).json(feedbacks);
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  export default router;
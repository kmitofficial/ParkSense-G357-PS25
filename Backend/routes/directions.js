// routes/directions.js
import express from 'express';
import Direction from '../models/Direction.js';

const router = express.Router();

// GET directions for a given slot
router.get('/:slot', async (req, res) => {
  const { slot } = req.params;

  try {
    const direction = await Direction.findOne({ slot });

    if (!direction) {
      return res.status(404).json({ error: 'Directions not found for this slot' });
    }

    res.status(200).json(direction);
  } catch (err) {
    console.error('Error fetching directions:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;

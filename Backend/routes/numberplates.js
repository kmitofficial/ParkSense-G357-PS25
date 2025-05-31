import express from 'express';
import NumberPlate from '../models/NumberPlate.js';

const router = express.Router();

// GET /api/numberplates/:plateNumber
router.get('/:plateNumber', async (req, res) => {
  try {
    const { plateNumber } = req.params;

    const numberPlate = await NumberPlate.findOne({ number: plateNumber});

    if (!numberPlate) {
      return res.status(404).json({ error: 'Number plate not found' });
    }

    res.status(200).json({ imageUrl: numberPlate.imageUrl });
  } catch (error) {
    console.error('Error fetching number plate:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/numberplate/:plateNumber

router.delete('/:plateNumber', async (req, res) => {
  try {
    const { plateNumber } = req.params;

    const deleted = await NumberPlate.findOneAndDelete({ number: plateNumber });

    if (!deleted) {
      return res.status(404).json({ error: 'Number plate not found' });
    }

    res.status(200).json({ message: 'Number plate deleted successfully' });
  } catch (error) {
    console.error('Error deleting number plate:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


export default router;
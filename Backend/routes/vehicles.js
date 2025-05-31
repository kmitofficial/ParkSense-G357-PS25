import express from 'express';
import Vehicle from '../models/Vehicle.js';

const router = express.Router();

// GET all vehicles
router.get('/', async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    res.status(200).json(vehicles);
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({ error: 'Failed to fetch vehicles' });
  }
});

router.get('/get/:plateNumber', async (req, res) => {
  try {
    const plateNumber = req.params.plateNumber;
    // Case-insensitive query
    const vehicle = await Vehicle.findOne({ plateNumber: { $regex: `^${plateNumber}$`, $options: 'i' }, status: "Active" });
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    res.json(vehicle);
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST a new vehicle
router.post('/:plateid', async (req, res) => {
    try {
      const { slot, phone } = req.body;
      const { plateid } = req.params;
  
      if (!slot || !phone) {
        return res.status(400).json({ error: 'Slot and phone are required' });
      }

      const existing = await Vehicle.findOne({ plateNumber: plateid, status: 'Active' });
      if (existing) {
        return res.status(409).json({ error: 'Vehicle with this plate number is already active.' });
      }
  
      const vehicle = new Vehicle({
        plateNumber: plateid,
        slot,
        entryTime: new Date().toISOString(),
        duration: '0h',
        status: 'Active',
        user: {
          phone,
        },
      });
  
      await vehicle.save();
      res.status(201).json(vehicle);
    } catch (error) {
      console.error('Error creating vehicle:', error);
      res.status(500).json({ error: 'Failed to create vehicle' });
    }
  });

  // GET /api/vehicles/active-count
  router.get('/active-count', async (req, res) => {
    try {
      const count = await Vehicle.countDocuments({ status: 'Active' });
      res.json({ count });
    } catch (error) {
      console.error('Error fetching active vehicle count:', error);
      res.status(500).json({ error: 'Server error' });
    }
  });



  router.put('/:plateNumber/exit', async (req, res) => {
    try {
      const { plateNumber } = req.params;
      const { exitTime, duration, status } = req.body;
  
      if (!plateNumber || !exitTime || !duration || !status) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
  
      const vehicle = await Vehicle.findOne({ plateNumber, status: "Active" });
  
      if (!vehicle) {
        return res.status(404).json({ message: 'Vehicle not found' });
      }
  
      vehicle.duration = duration;
      vehicle.status = status;
      vehicle.exitTime = exitTime; // optional field if you're storing it
  
      await vehicle.save();
  
      return res.status(200).json({ message: 'Vehicle updated successfully', vehicle });
    } catch (err) {
      console.error('Error updating vehicle:', err);
      return res.status(500).json({ message: 'Server error' });
    }
  });

export default router;
import { Router } from 'express';
import QRCode from 'qrcode';
import NumberPlate from '../models/NumberPlate.js';

const router = Router();

router.post('/generate', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'Invalid URL' });
    }

    const qrDataURL = await QRCode.toDataURL(url);
    res.json({ qr: qrDataURL });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

// routes/qrcode.js
router.get('/generate-latest-qr', async (req, res) => {
  try {
    const latestVehicle = await NumberPlate.findOne().sort({ uploadedAt: -1 });

    if (!latestVehicle) return res.status(404).json({ error: 'No vehicles found' });

    const qrText = `https://parksense-frontend.vercel.app/user/${latestVehicle.number}`;

    QRCode.toDataURL(qrText, (err, url) => {
      if (err) return res.status(500).json({ error: 'QR generation failed' });

      res.json({ qrText, qrImageUrl: url }); // base64 image
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;



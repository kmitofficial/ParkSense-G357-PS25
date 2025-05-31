import express from "express"
import multer from "multer";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import QRCode from "qrcode"
import { v4 as uuidv4 } from 'uuid';
import path from "path"
import NumberPlate from "../models/NumberPlate.js";
import dotenv from "dotenv";
dotenv.config();

const router = express.Router();

// Multer setup
const storage = multer.memoryStorage();
const upload = multer({ storage });

// AWS S3 setup
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});


router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const { number } = req.body;
    const file = req.file;

    if (!number || !file) {
      return res.status(400).json({ error: 'Number and image are required.' });
    }

    const fileExt = path.extname(file.originalname);
    const key = `numberplates/${uuidv4()}${fileExt}`;

    const uploadParams = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    await s3.send(new PutObjectCommand(uploadParams));

    const imageUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    const newEntry = new NumberPlate({ number, imageUrl });
    await newEntry.save();

    const qrData = `Number Plate: ${number}\nImage URL: ${imageUrl}`;
    const qrCodeDataUrl = await QRCode.toDataURL(qrData);

    res.status(201).json({
      message: 'Uploaded and QR generated successfully',
      qrCode: qrCodeDataUrl,
      details: { number, imageUrl }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Upload or QR generation failed' });
  }
});

export default router

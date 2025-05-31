import mongoose from 'mongoose';

const numberPlateSchema = new mongoose.Schema({
  number: { type: String, required: true },
  imageUrl: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
});

export default mongoose.model('NumberPlate', numberPlateSchema);

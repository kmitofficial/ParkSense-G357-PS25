// models/Direction.js
import mongoose from 'mongoose';

const directionSchema = new mongoose.Schema({
  slot: { type: String, required: true, unique: true },
  fromEntrance: { type: [String], required: true },
  toExit: { type: [String], required: true },
}, { timestamps: true });

export default mongoose.model('Direction', directionSchema);

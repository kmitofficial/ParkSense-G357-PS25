import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
  plateNumber: {
    type: String,
    required: true,
    unique: true,
  },
  slot: {
    type: String,
    required: true,
  },
  entryTime: {
    type: String,
    required: true,
  },
  duration: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Active', 'Exited'],
    required: true,
  },
  user: {
    phone: {
      type: String,
      required: true,
    },
  },
}, { timestamps: true });

// Add virtual `id` field
vehicleSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

// Ensure virtuals are serialized to JSON
vehicleSchema.set('toJSON', {
  virtuals: true,
});

export default mongoose.model('Vehicle', vehicleSchema);
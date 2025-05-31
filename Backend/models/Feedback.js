import mongoose from "mongoose"

const feedbackSchema = new mongoose.Schema({
    plateNumber: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
      },
      comment: {
        type: String,
        trim: true
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
})

export default mongoose.model('Feedback', feedbackSchema);
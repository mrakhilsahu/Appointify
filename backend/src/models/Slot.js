import mongoose from "mongoose";

const slotSchema = new mongoose.Schema(
  {
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true
    },
    date: {
      type: String,
      required: true
    },
    startTime: {
      type: String,
      required: true
    },
    endTime: {
      type: String,
      required: true
    },
    capacity: {
      type: Number,
      default: 1,
      min: 1,
      max: 100
    },
    availableSeats: {
      type: Number,
      default: 1,
      min: 0,
      max: 100
    }
  },
  { timestamps: true }
);

slotSchema.index({ providerId: 1, date: 1, startTime: 1 });
slotSchema.index(
  { providerId: 1, serviceId: 1, date: 1, startTime: 1 },
  { unique: true }
);

export default mongoose.model("Slot", slotSchema);

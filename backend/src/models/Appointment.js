import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true
    },
    slotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Slot",
      required: true
    },
    status: {
      type: String,
      enum: ["confirmed", "cancelled", "completed", "rejected"],
      default: "confirmed"
    },
    bookedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

appointmentSchema.index(
  { userId: 1, slotId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ["confirmed", "completed"] }
    }
  }
);

appointmentSchema.index({ providerId: 1, status: 1 });
appointmentSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model("Appointment", appointmentSchema);

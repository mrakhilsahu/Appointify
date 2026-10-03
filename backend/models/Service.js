import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema(
  {
    providerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },

    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: ""
    },

    durationMinutes: {
      type: Number,
      required: true,
      min: 5,
      max: 480
    },

    active: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

serviceSchema.index({ providerId: 1, name: 1 }, { unique: true });

export default mongoose.model("Service", serviceSchema);
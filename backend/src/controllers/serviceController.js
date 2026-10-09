import mongoose from "mongoose";
import Service from "../models/Service.js";

export async function listServices(req, res) {
  const { providerId, search } = req.query;
  const query = { active: true };

  if (providerId) {
    if (!mongoose.isValidObjectId(providerId)) {
      return res.status(400).json({ message: "Invalid providerId" });
    }

    query.providerId = providerId;
  }

  if (search?.trim()) {
    const value = search.trim();
    query.$or = [
      { name: { $regex: value, $options: "i" } },
      { description: { $regex: value, $options: "i" } }
    ];
  }

  const services = await Service.find(query)
    .populate("providerId", "name specialization bio")
    .sort({ name: 1 });

  res.json({ services });
}

export async function providerServices(req, res) {
  const services = await Service.find({ providerId: req.user._id }).sort({
    createdAt: -1
  });

  res.json({ services });
}

export async function createService(req, res) {
  const { name, description = "", durationMinutes = 30 } = req.body;
  const duration = Number(durationMinutes);

  if (!name?.trim()) {
    return res.status(400).json({ message: "Service name is required" });
  }

  if (!Number.isInteger(duration) || duration < 5 || duration > 480) {
    return res.status(400).json({
      message: "Duration must be between 5 and 480 minutes"
    });
  }

  try {
    const service = await Service.create({
      providerId: req.user._id,
      name: name.trim(),
      description: String(description).trim(),
      durationMinutes: duration
    });

    res.status(201).json({ service });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "You already have a service with this name"
      });
    }

    throw error;
  }
}

export async function updateService(req, res) {
  const { name, description = "", durationMinutes } = req.body;
  const duration = Number(durationMinutes);

  if (!name?.trim()) {
    return res.status(400).json({ message: "Service name is required" });
  }

  if (!Number.isInteger(duration) || duration < 5 || duration > 480) {
    return res.status(400).json({
      message: "Duration must be between 5 and 480 minutes"
    });
  }

  try {
    const service = await Service.findOneAndUpdate(
      {
        _id: req.params.id,
        providerId: req.user._id
      },
      {
        name: name.trim(),
        description: String(description).trim(),
        durationMinutes: duration
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.json({ service });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "You already have a service with this name"
      });
    }

    throw error;
  }
}

export async function deleteService(req, res) {
  const service = await Service.findOneAndUpdate(
    {
      _id: req.params.id,
      providerId: req.user._id
    },
    { active: false },
    { new: true }
  );

  if (!service) {
    return res.status(404).json({ message: "Service not found" });
  }

  res.json({ message: "Service disabled" });
}

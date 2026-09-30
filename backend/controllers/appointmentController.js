import mongoose from "mongoose";
import Appointment from "../models/Appointment.js";
import Service from "../models/Service.js";
import Slot from "../models/Slot.js";
import { isSlotInPast, sendEmail } from "../utils.js";

const STATUS = {
  CONFIRMED: "confirmed",
  CANCELLED: "cancelled",
  COMPLETED: "completed",
  REJECTED: "rejected"
};

function populateAppointment(appointment) {
  return appointment.populate([
    { path: "userId", select: "name email" },
    { path: "providerId", select: "name email specialization" },
    { path: "serviceId", select: "name durationMinutes" },
    { path: "slotId", select: "date startTime endTime availableSeats capacity" }
  ]);
}

async function sendAppointmentEmail(appointment, action) {
  try {
    const populated = await populateAppointment(appointment);
    const user = populated.userId;
    const provider = populated.providerId;
    const service = populated.serviceId;
    const slot = populated.slotId;

    if (!user?.email || !slot) return;

    const subject = `Appointify: appointment ${action}`;
    const text = `Your appointment with ${provider?.name || "your provider"} for ${service?.name || "your service"} on ${slot.date} at ${slot.startTime} is ${action}.`;

    await sendEmail({
      to: user.email,
      subject,
      text
    });

    if (provider?.email && action === STATUS.CONFIRMED) {
      await sendEmail({
        to: provider.email,
        subject: "Appointify: new appointment",
        text: `A new appointment has been booked by ${user.name} for ${service?.name || "a service"} on ${slot.date} at ${slot.startTime}.`
      });
    }
  } catch (error) {
    console.error("Appointment email error:", error.message);
  }
}

export async function createAppointment(req, res) {
  const { slotId } = req.body;

  if (!slotId || !mongoose.isValidObjectId(slotId)) {
    return res.status(400).json({ message: "Valid slotId is required" });
  }

  // Decreasing the seat and checking availability happen in one database operation.
  const slot = await Slot.findOneAndUpdate(
    {
      _id: slotId,
      availableSeats: { $gt: 0 }
    },
    { $inc: { availableSeats: -1 } },
    { new: true }
  );

  if (!slot) {
    return res.status(409).json({ message: "Slot is no longer available" });
  }

  try {
    if (isSlotInPast(slot.date, slot.startTime)) {
      await restoreSeat(slot._id);
      return res.status(409).json({ message: "This slot has already passed" });
    }

    const service = await Service.findOne({
      _id: slot.serviceId,
      active: true
    });

    if (!service) {
      await restoreSeat(slot._id);
      return res.status(409).json({ message: "Service is no longer available" });
    }

    const appointment = await Appointment.create({
      userId: req.user._id,
      providerId: slot.providerId,
      serviceId: slot.serviceId,
      slotId: slot._id,
      status: STATUS.CONFIRMED
    });

    const populated = await populateAppointment(appointment);
    sendAppointmentEmail(appointment, STATUS.CONFIRMED);

    return res.status(201).json({ appointment: populated });
  } catch (error) {
    await restoreSeat(slot._id);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "You already have an active booking for this slot"
      });
    }

    throw error;
  }
}

export async function myAppointments(req, res) {
  const appointments = await Appointment.find({ userId: req.user._id })
    .populate("providerId", "name email specialization")
    .populate("serviceId", "name durationMinutes")
    .populate("slotId", "date startTime endTime")
    .sort({ createdAt: -1 });

  res.json({ appointments });
}

export async function providerAppointments(req, res) {
  const appointments = await Appointment.find({ providerId: req.user._id })
    .populate("userId", "name email")
    .populate("serviceId", "name durationMinutes")
    .populate("slotId", "date startTime endTime")
    .sort({ createdAt: -1 });

  res.json({ appointments });
}

export async function cancelAppointment(req, res) {
  const filter =
    req.user.role === "provider"
      ? {
          _id: req.params.id,
          providerId: req.user._id,
          status: STATUS.CONFIRMED
        }
      : {
          _id: req.params.id,
          userId: req.user._id,
          status: STATUS.CONFIRMED
        };

  const appointment = await Appointment.findOneAndUpdate(
    filter,
    { status: STATUS.CANCELLED },
    { new: true }
  );

  if (!appointment) {
    return res.status(404).json({
      message: "Confirmed appointment not found"
    });
  }

  await restoreSeat(appointment.slotId);
  sendAppointmentEmail(appointment, STATUS.CANCELLED);

  return res.json({ appointment });
}

export async function rescheduleAppointment(req, res) {
  const { slotId: newSlotId } = req.body;

  if (!newSlotId || !mongoose.isValidObjectId(newSlotId)) {
    return res.status(400).json({ message: "Valid new slotId is required" });
  }

  const appointment = await Appointment.findOne({
    _id: req.params.id,
    userId: req.user._id,
    status: STATUS.CONFIRMED
  });

  if (!appointment) {
    return res.status(404).json({
      message: "Confirmed appointment not found"
    });
  }

  if (appointment.slotId.toString() === newSlotId) {
    return res.status(400).json({ message: "Choose a different slot" });
  }

  const requestedSlot = await Slot.findOne({
    _id: newSlotId,
    providerId: appointment.providerId,
    serviceId: appointment.serviceId
  }).select("date startTime");

  if (!requestedSlot) {
    return res.status(409).json({ message: "New slot is not available" });
  }

  if (isSlotInPast(requestedSlot.date, requestedSlot.startTime)) {
    return res.status(409).json({ message: "Cannot reschedule to a past slot" });
  }

  const newSlot = await Slot.findOneAndUpdate(
    {
      _id: newSlotId,
      providerId: appointment.providerId,
      serviceId: appointment.serviceId,
      availableSeats: { $gt: 0 }
    },
    { $inc: { availableSeats: -1 } },
    { new: true }
  );

  if (!newSlot) {
    return res.status(409).json({
      message: "New slot is no longer available"
    });
  }

  const oldSlotId = appointment.slotId;

  try {
    appointment.slotId = newSlot._id;
    await appointment.save();
    await restoreSeat(oldSlotId);

    return res.json({
      appointment: await populateAppointment(appointment)
    });
  } catch (error) {
    await restoreSeat(newSlot._id);

    if (error.code === 11000) {
      return res.status(409).json({
        message: "You already have an active booking for the selected slot"
      });
    }

    throw error;
  }
}

export async function updateProviderAppointment(req, res) {
  const { status } = req.body;
  const allowedStatuses = Object.values(STATUS);

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid appointment status" });
  }

  const appointment = await Appointment.findOne({
    _id: req.params.id,
    providerId: req.user._id
  });

  if (!appointment) {
    return res.status(404).json({ message: "Appointment not found" });
  }

  const oldStatus = appointment.status;

  if (oldStatus === status) {
    return res.json({ appointment });
  }

  if (oldStatus !== STATUS.CONFIRMED) {
    return res.status(409).json({
      message: "Only confirmed appointments can be updated"
    });
  }

  if (
    ![STATUS.COMPLETED, STATUS.CANCELLED, STATUS.REJECTED].includes(status)
  ) {
    return res.status(400).json({ message: "Invalid status transition" });
  }

  if (status === STATUS.COMPLETED) {
    const slot = await Slot.findById(appointment.slotId).select("date startTime");
    if (!slot || !isSlotInPast(slot.date, slot.startTime)) {
      return res.status(409).json({
        message: "An appointment can be completed only after its scheduled time"
      });
    }
  }

  appointment.status = status;
  await appointment.save();

  if ([STATUS.CANCELLED, STATUS.REJECTED].includes(status)) {
    await restoreSeat(appointment.slotId);
  }

  if (status === STATUS.CANCELLED || status === STATUS.REJECTED) {
    sendAppointmentEmail(appointment, status);
  }

  return res.json({ appointment });
}

async function restoreSeat(slotId) {
  const slot = await Slot.findById(slotId).select("capacity availableSeats");

  if (!slot) return;

  slot.availableSeats = Math.min(slot.capacity, slot.availableSeats + 1);
  await slot.save();
}

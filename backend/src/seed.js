import "dotenv/config";
import bcrypt from "bcryptjs";
import { connectDB } from "./config/db.js";
import Appointment from "./models/Appointment.js";
import Service from "./models/Service.js";
import Slot from "./models/Slot.js";
import User from "./models/User.js";
import { todayISO } from "./utils.js";

await connectDB();

await User.deleteOne({ email: "admin@appointify.local", role: "provider" });

const password = await bcrypt.hash("Provider@12345", 12);

const provider = await User.findOneAndUpdate(
  { email: "provider@appointify.local" },
  {
    name: "Dr. Appointify",
    email: "provider@appointify.local",
    password,
    role: "provider",
    specialization: "General Consultation",
    bio: "Demo provider for Appointify."
  },
  {
    upsert: true,
    new: true,
    setDefaultsOnInsert: true
  }
);

const servicesToCreate = [
  {
    name: "General Consultation",
    description: "A standard consultation appointment.",
    durationMinutes: 30
  },
  {
    name: "Follow-up Consultation",
    description: "A focused follow-up appointment.",
    durationMinutes: 20
  }
];

for (const serviceData of servicesToCreate) {
  await Service.updateOne(
    {
      providerId: provider._id,
      name: serviceData.name
    },
    {
      $setOnInsert: {
        providerId: provider._id,
        ...serviceData
      }
    },
    { upsert: true }
  );
}

const services = await Service.find({
  providerId: provider._id,
  active: true
});

const startDate = new Date(`${todayISO()}T12:00:00`);

for (let day = 0; day < 7; day += 1) {
  const date = new Date(startDate);
  date.setDate(startDate.getDate() + day);
  const dateText = date.toISOString().slice(0, 10);

  for (const service of services) {
    const times =
      service.durationMinutes === 20
        ? [
            ["09:30", "09:50"],
            ["10:30", "10:50"],
            ["11:30", "11:50"],
            ["14:30", "14:50"]
          ]
        : [
            ["09:00", "09:30"],
            ["10:00", "10:30"],
            ["11:00", "11:30"],
            ["14:00", "14:30"]
          ];

    for (const [startTime, endTime] of times) {
      await Slot.updateOne(
        {
          providerId: provider._id,
          serviceId: service._id,
          date: dateText,
          startTime
        },
        {
          $setOnInsert: {
            providerId: provider._id,
            serviceId: service._id,
            date: dateText,
            startTime,
            endTime,
            capacity: 1,
            availableSeats: 1
          }
        },
        { upsert: true }
      );
    }
  }
}

// Keep legacy records usable when older data did not store providerId.
for (const service of await Service.find({ providerId: { $exists: false } })) {
  await Service.updateOne(
    { _id: service._id },
    { $set: { providerId: provider._id } }
  );
}

for (const slot of await Slot.find({ providerId: { $exists: false } })) {
  const service = await Service.findById(slot.serviceId);

  if (service) {
    await Slot.updateOne(
      { _id: slot._id },
      { $set: { providerId: service.providerId } }
    );
  }
}

for (const appointment of await Appointment.find({
  providerId: { $exists: false }
})) {
  const slot = await Slot.findById(appointment.slotId);

  if (slot) {
    await Appointment.updateOne(
      { _id: appointment._id },
      { $set: { providerId: slot.providerId } }
    );
  }
}

console.log("Seed completed.");
console.log("Provider: provider@appointify.local / Provider@12345");
process.exit(0);

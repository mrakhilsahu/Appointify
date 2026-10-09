import { Router } from "express";
import {
  cancelAppointment,
  createAppointment,
  myAppointments,
  providerAppointments,
  rescheduleAppointment,
  updateProviderAppointment
} from "../controllers/appointmentController.js";
import { protect, providerOnly, userOnly } from "../middleware/auth.js";

const router = Router();

router.post("/", protect, userOnly, createAppointment);
router.get("/my", protect, userOnly, myAppointments);
router.get("/provider", protect, providerOnly, providerAppointments);
router.patch("/:id/cancel", protect, cancelAppointment);
router.patch("/:id/reschedule", protect, userOnly, rescheduleAppointment);
router.patch(
  "/provider/:id/status",
  protect,
  providerOnly,
  updateProviderAppointment
);

export default router;

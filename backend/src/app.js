import express from "express";
import cors from "cors";
import { requireAuth, requireRoles } from "./middleware/auth.js";
import * as auth from "./controllers/authController.js";
import * as clinicPublic from "./controllers/clinicPublicController.js";
import * as admin from "./controllers/adminController.js";
import * as doctor from "./controllers/doctorController.js";
import * as patient from "./controllers/patientController.js";
import * as appointments from "./controllers/appointmentController.js";

export function createApp() {
  const app = express();
  app.use(cors({ origin: true }));
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.post("/auth/register", auth.registerPatient);
  app.post("/auth/login", auth.login);

  app.get("/me", requireAuth, auth.me);

  app.get("/clinics", clinicPublic.listClinics);
  app.get("/clinics/:id", clinicPublic.getClinicById);

  app.get(
    "/admin/clinic",
    requireAuth,
    requireRoles("CLINIC_ADMIN"),
    admin.getMyClinic
  );
  app.patch(
    "/admin/clinic",
    requireAuth,
    requireRoles("CLINIC_ADMIN"),
    admin.patchMyClinic
  );
  app.post(
    "/admin/doctors",
    requireAuth,
    requireRoles("CLINIC_ADMIN"),
    admin.createDoctor
  );
  app.get(
    "/admin/doctors",
    requireAuth,
    requireRoles("CLINIC_ADMIN"),
    admin.listDoctors
  );
  app.get(
    "/admin/patients",
    requireAuth,
    requireRoles("CLINIC_ADMIN"),
    admin.listPatients
  );

  app.get("/appointments", requireAuth, appointments.listAppointments);
  app.post(
    "/appointments",
    requireAuth,
    requireRoles("CLINIC_ADMIN"),
    appointments.createAppointment
  );
  app.patch(
    "/appointments/:id/confirm",
    requireAuth,
    requireRoles("DOCTOR"),
    appointments.confirmAppointment
  );
  app.patch(
    "/appointments/:id/cancel",
    requireAuth,
    requireRoles("CLINIC_ADMIN", "DOCTOR"),
    appointments.cancelAppointment
  );

  app.get("/doctor/me", requireAuth, requireRoles("DOCTOR"), doctor.getMe);
  app.get(
    "/doctor/patients",
    requireAuth,
    requireRoles("DOCTOR"),
    doctor.listPatients
  );

  app.get("/patient/me", requireAuth, requireRoles("PATIENT"), patient.getMe);
  app.get(
    "/patient/clinic",
    requireAuth,
    requireRoles("PATIENT"),
    patient.getMyClinic
  );
  app.get(
    "/patient/appointments",
    requireAuth,
    requireRoles("PATIENT"),
    appointments.listPatientAppointments
  );

  app.use((_req, res) => {
    res.status(404).json({ error: "Rota não encontrada" });
  });

  app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: "Erro interno" });
  });

  return app;
}

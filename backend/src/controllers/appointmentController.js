import { prisma } from "../db.js";

function mapAppointmentPublic(row) {
  return {
    id: row.id,
    clinicId: row.clinicId,
    doctorId: row.doctorId,
    patientId: row.patientId,
    scheduledAt: row.scheduledAt,
    status: row.status,
    notes: row.notes,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

/** Lista por perfil — GET /appointments */
export async function listAppointments(req, res, next) {
  try {
    const { role, userId, clinicId } = req.user;

    if (role === "CLINIC_ADMIN") {
      const list = await prisma.appointment.findMany({
        where: { clinicId },
        orderBy: { scheduledAt: "asc" },
        include: { doctor: true, patient: true },
      });
      return res.json(
        list.map((a) => ({
          ...mapAppointmentPublic(a),
          doctor: a.doctor
            ? { id: a.doctor.id, name: a.doctor.name, email: a.doctor.email }
            : null,
          patient: a.patient
            ? { id: a.patient.id, name: a.patient.name, email: a.patient.email }
            : null,
        }))
      );
    }

    if (role === "DOCTOR") {
      const list = await prisma.appointment.findMany({
        where: { doctorId: userId, clinicId },
        orderBy: { scheduledAt: "asc" },
        include: { patient: true },
      });
      return res.json(
        list.map((a) => ({
          ...mapAppointmentPublic(a),
          patient: a.patient
            ? { id: a.patient.id, name: a.patient.name, email: a.patient.email }
            : null,
        }))
      );
    }

    if (role === "PATIENT") {
      const list = await prisma.appointment.findMany({
        where: { clinicId },
        orderBy: { scheduledAt: "asc" },
        include: { doctor: true },
      });
      return res.json(
        list.map((a) => ({
          ...mapAppointmentPublic(a),
          doctor: a.doctor
            ? { id: a.doctor.id, name: a.doctor.name, email: a.doctor.email }
            : null,
        }))
      );
    }

    return res.status(403).json({ error: "Perfil não suportado" });
  } catch (e) {
    next(e);
  }
}

/** Admin cria agendamento — POST /appointments */
export async function createAppointment(req, res, next) {
  try {
    const { patientId, doctorId, scheduledAt, notes } = req.body ?? {};
    if (typeof patientId !== "string" || !patientId.trim()) {
      return res.status(400).json({ error: "patientId é obrigatório" });
    }
    if (typeof doctorId !== "string" || !doctorId.trim()) {
      return res.status(400).json({ error: "doctorId é obrigatório" });
    }
    if (!scheduledAt) {
      return res.status(400).json({ error: "scheduledAt é obrigatório (ISO 8601)" });
    }
    const at = new Date(scheduledAt);
    if (Number.isNaN(at.getTime())) {
      return res.status(400).json({ error: "scheduledAt inválido" });
    }

    const patient = await prisma.user.findUnique({ where: { id: patientId } });
    if (!patient || patient.role !== "PATIENT") {
      return res.status(400).json({ error: "Paciente inválido" });
    }
    if (patient.clinicId !== req.user.clinicId) {
      return res.status(400).json({ error: "Paciente deve pertencer à sua clínica" });
    }
    const doctor = await prisma.user.findUnique({ where: { id: doctorId } });
    if (!doctor || doctor.role !== "DOCTOR") {
      return res.status(400).json({ error: "Médico inválido" });
    }

    const created = await prisma.appointment.create({
      data: {
        clinicId: req.user.clinicId,
        doctorId: doctor.id,
        patientId: patient.id,
        scheduledAt: at,
        notes: notes != null && String(notes).trim() ? String(notes).trim() : null,
        status: "SCHEDULED",
      },
    });
    res.status(201).json(mapAppointmentPublic(created));
  } catch (e) {
    next(e);
  }
}

/** Médico confirma — PATCH /appointments/:id/confirm */
export async function confirmAppointment(req, res, next) {
  try {
    const row = await prisma.appointment.findUnique({ where: { id: req.params.id } });
    if (!row) {
      return res.status(404).json({ error: "Consulta não encontrada" });
    }
    if (row.clinicId !== req.user.clinicId || row.doctorId !== req.user.userId) {
      return res.status(403).json({ error: "Acesso negado" });
    }
    if (row.scheduledAt < new Date()) {
      return res.status(400).json({ error: "Não é possível confirmar consulta já passada" });
    }

    const updated = await prisma.appointment.update({
      where: { id: row.id },
      data: { status: "CONFIRMED" },
    });
    res.json(mapAppointmentPublic(updated));
  } catch (e) {
    next(e);
  }
}

/** Admin ou médico cancela — PATCH /appointments/:id/cancel */
export async function cancelAppointment(req, res, next) {
  try {
    const row = await prisma.appointment.findUnique({ where: { id: req.params.id } });
    if (!row) {
      return res.status(404).json({ error: "Consulta não encontrada" });
    }
    if (row.clinicId !== req.user.clinicId) {
      return res.status(403).json({ error: "Acesso negado" });
    }
    if (req.user.role === "DOCTOR" && row.doctorId !== req.user.userId) {
      return res.status(403).json({ error: "Acesso negado" });
    }
    if (req.user.role === "CLINIC_ADMIN") {
      const ok = row.clinicId === req.user.clinicId;
      if (!ok) {
        return res.status(403).json({ error: "Acesso negado" });
      }
    }

    await prisma.$executeRawUnsafe(
      `UPDATE "Appointment" SET status = 'CANCELLED'::"AppointmentStatus" WHERE id = $1`,
      req.params.id
    );

    const after = await prisma.appointment.findUnique({ where: { id: req.params.id } });
    res.json(mapAppointmentPublic(after));
  } catch (e) {
    next(e);
  }
}

/** Paciente: lista só as suas — GET /patient/appointments (formato alternativo) */
export async function listPatientAppointments(req, res, next) {
  try {
    const list = await prisma.appointment.findMany({
      where: { patientId: req.user.userId, clinicId: req.user.clinicId },
      orderBy: { scheduledAt: "asc" },
      include: { doctor: true },
    });
    const body = list.map((a) => ({
      id: a.id,
      clinic_id: a.clinicId,
      doctor_id: a.doctorId,
      patient_id: a.patientId,
      scheduled_at: a.scheduledAt.toISOString(),
      status: a.status,
      notes: a.notes,
      doctor: a.doctor ? { id: a.doctor.id, name: a.doctor.name } : null,
    }));
    res.json(body);
  } catch (e) {
    next(e);
  }
}

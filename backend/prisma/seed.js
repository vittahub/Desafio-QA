import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  await prisma.appointment.deleteMany();
  await prisma.user.deleteMany();
  await prisma.clinic.deleteMany();

  const passwordHash = await bcrypt.hash("senha123", 10);

  const clinic = await prisma.clinic.create({
    data: {
      name: "Clínica Vitta Hub",
      city: "São Paulo, SP",
    },
  });

  await prisma.user.create({
    data: {
      email: "admin@clinica.com",
      passwordHash,
      name: "Admin da Clínica",
      role: "CLINIC_ADMIN",
      clinicId: clinic.id,
    },
  });

  const doctor = await prisma.user.create({
    data: {
      email: "medico@clinica.com",
      passwordHash,
      name: "Dr. João Silva",
      role: "DOCTOR",
      clinicId: clinic.id,
    },
  });

  const patient = await prisma.user.create({
    data: {
      email: "paciente@clinica.com",
      passwordHash,
      name: "Maria Paciente",
      role: "PATIENT",
      clinicId: clinic.id,
    },
  });

  await prisma.user.create({
    data: {
      email: "outro.paciente@clinica.com",
      passwordHash,
      name: "Carlos Paciente",
      role: "PATIENT",
      clinicId: clinic.id,
    },
  });

  const clinic2 = await prisma.clinic.create({
    data: { name: "Clínica Aurora", city: "Campinas, SP" },
  });

  await prisma.user.create({
    data: {
      email: "outro.admin@clinica.com",
      passwordHash,
      name: "Outro Admin",
      role: "CLINIC_ADMIN",
      clinicId: clinic2.id,
    },
  });

  await prisma.user.create({
    data: {
      email: "medico.aurora@clinica.com",
      passwordHash,
      name: "Dra. Aurora",
      role: "DOCTOR",
      clinicId: clinic2.id,
    },
  });

  const future = new Date();
  future.setDate(future.getDate() + 7);

  await prisma.appointment.create({
    data: {
      clinicId: clinic.id,
      doctorId: doctor.id,
      patientId: patient.id,
      scheduledAt: future,
      status: "SCHEDULED",
      notes: "Consulta de rotina (seed)",
    },
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });

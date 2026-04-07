import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
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

  await prisma.user.create({
    data: {
      email: "medico@clinica.com",
      passwordHash,
      name: "Dr. João Silva",
      role: "DOCTOR",
      clinicId: clinic.id,
    },
  });

  await prisma.user.create({
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
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });

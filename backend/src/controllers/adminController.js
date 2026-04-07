import { prisma } from "../db.js";
import { hashPassword } from "../utils/password.js";
import { toPublicUser } from "../utils/userDto.js";

export async function getMyClinic(req, res, next) {
  try {
    const clinic = await prisma.clinic.findUnique({
      where: { id: req.user.clinicId },
    });
    if (!clinic) {
      return res.status(404).json({ error: "Clínica não encontrada" });
    }
    res.json(clinic);
  } catch (e) {
    next(e);
  }
}

export async function patchMyClinic(req, res, next) {
  try {
    const { name, city } = req.body ?? {};
    const data = {};
    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({ error: "name inválido" });
      }
      data.name = name.trim();
    }
    if (city !== undefined) {
      if (city !== null && typeof city !== "string") {
        return res.status(400).json({ error: "city deve ser texto ou null" });
      }
      data.city = city === null || String(city).trim() === "" ? null : String(city).trim();
    }
    if (Object.keys(data).length === 0) {
      return res.status(400).json({ error: "Envie name e/ou city" });
    }

    const updated = await prisma.clinic.update({
      where: { id: req.user.clinicId },
      data,
    });
    res.json(updated);
  } catch (e) {
    if (e.code === "P2025") {
      return res.status(404).json({ error: "Clínica não encontrada" });
    }
    next(e);
  }
}

export async function createDoctor(req, res, next) {
  try {
    const { email, password, name } = req.body ?? {};
    if (typeof email !== "string" || !email.trim()) {
      return res.status(400).json({ error: "email é obrigatório" });
    }
    if (typeof password !== "string" || password.length < 6) {
      return res.status(400).json({ error: "password deve ter no mínimo 6 caracteres" });
    }
    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ error: "name é obrigatório" });
    }

    const passwordHash = await hashPassword(password);
    const doctor = await prisma.user.create({
      data: {
        email: email.trim().toLowerCase(),
        passwordHash,
        name: name.trim(),
        role: "DOCTOR",
        clinicId: req.user.clinicId,
      },
    });
    res.status(201).json(toPublicUser(doctor));
  } catch (e) {
    if (e.code === "P2002") {
      return res.status(409).json({ error: "E-mail já cadastrado" });
    }
    next(e);
  }
}

export async function listDoctors(req, res, next) {
  try {
    const list = await prisma.user.findMany({
      where: {
        clinicId: req.user.clinicId,
        role: "DOCTOR",
      },
      orderBy: { name: "asc" },
    });
    res.json(list.map(toPublicUser));
  } catch (e) {
    next(e);
  }
}

export async function listPatients(req, res, next) {
  try {
    const list = await prisma.user.findMany({
      where: {
        clinicId: req.user.clinicId,
        role: "PATIENT",
      },
      orderBy: { name: "asc" },
    });
    res.json(list.map(toPublicUser));
  } catch (e) {
    next(e);
  }
}

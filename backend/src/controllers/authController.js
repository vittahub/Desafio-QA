import { prisma } from "../db.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { signToken } from "../utils/token.js";
import { toPublicUser } from "../utils/userDto.js";

export async function registerPatient(req, res, next) {
  try {
    const { email, password, name, clinicId } = req.body ?? {};
    if (typeof email !== "string" || !email.trim()) {
      return res.status(400).json({ error: "email é obrigatório" });
    }
    if (typeof password !== "string" || password.length < 6) {
      return res.status(400).json({ error: "password deve ter no mínimo 6 caracteres" });
    }
    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ error: "name é obrigatório" });
    }
    if (typeof clinicId !== "string" || !clinicId.trim()) {
      return res.status(400).json({ error: "clinicId é obrigatório para paciente" });
    }

    const clinic = await prisma.clinic.findUnique({ where: { id: clinicId } });
    if (!clinic) {
      return res.status(400).json({ error: "Clínica não encontrada" });
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email: email.trim().toLowerCase(),
        passwordHash,
        name: name.trim(),
        role: "PATIENT",
        clinicId: clinic.id,
      },
    });

    const token = signToken({
      userId: user.id,
      role: user.role,
      clinicId: user.clinicId,
    });

    res.status(201).json({ token, user: toPublicUser(user) });
  } catch (e) {
    if (e.code === "P2002") {
      return res.status(409).json({ error: "E-mail já cadastrado" });
    }
    next(e);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body ?? {};
    if (typeof email !== "string" || !email.trim()) {
      return res.status(400).json({ error: "email é obrigatório" });
    }
    if (typeof password !== "string") {
      return res.status(400).json({ error: "password é obrigatório" });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    const token = signToken({
      userId: user.id,
      role: user.role,
      clinicId: user.clinicId,
    });

    res.json({ token, user: toPublicUser(user) });
  } catch (e) {
    next(e);
  }
}

export async function me(req, res, next) {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user) {
      return res.status(404).json({ error: "Utilizador não encontrado" });
    }
    res.json(toPublicUser(user));
  } catch (e) {
    next(e);
  }
}

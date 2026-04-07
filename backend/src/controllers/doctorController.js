import { prisma } from "../db.js";
import { toPublicUser } from "../utils/userDto.js";

export async function getMe(req, res, next) {
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

/** Médico: lista pacientes da mesma clínica. */
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

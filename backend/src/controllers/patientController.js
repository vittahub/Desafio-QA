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

/** Paciente: dados da clínica onde está registado. */
export async function getMyClinic(req, res, next) {
  try {
    if (!req.user.clinicId) {
      return res.status(404).json({ error: "Sem clínica associada" });
    }
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

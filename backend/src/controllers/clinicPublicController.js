import { prisma } from "../db.js";

export async function listClinics(_req, res, next) {
  try {
    const list = await prisma.clinic.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        city: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    res.json(list);
  } catch (e) {
    next(e);
  }
}

export async function getClinicById(req, res, next) {
  try {
    const row = await prisma.clinic.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        name: true,
        city: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!row) {
      return res.status(404).json({ error: "Clínica não encontrada" });
    }
    res.json(row);
  } catch (e) {
    next(e);
  }
}

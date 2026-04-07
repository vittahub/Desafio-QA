import { verifyToken } from "../utils/token.js";

export function requireAuth(req, res, next) {
  const h = req.headers.authorization;
  if (!h?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token ausente" });
  }
  try {
    const payload = verifyToken(h.slice(7));
    req.user = {
      userId: payload.sub,
      role: payload.role,
      clinicId: payload.clinicId ?? null,
    };
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido ou expirado" });
  }
}

export function requireRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Não autenticado" });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Acesso negado para este perfil" });
    }
    next();
  };
}

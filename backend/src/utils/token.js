import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config.js";

export function signToken({ userId, role, clinicId }) {
  return jwt.sign(
    { sub: userId, role, clinicId },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

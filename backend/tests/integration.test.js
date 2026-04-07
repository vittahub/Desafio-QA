import "dotenv/config";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import { createApp } from "../src/app.js";
import { prisma } from "../src/db.js";
import { hashPassword } from "../src/utils/password.js";

const app = createApp();

let clinicId;
let adminToken;
let doctorToken;
let patientToken;

beforeAll(async () => {
  await prisma.$executeRawUnsafe(`TRUNCATE TABLE "Clinic" CASCADE`);

  const clinic = await prisma.clinic.create({
    data: { name: "Clínica Teste Integração", city: "São Paulo" },
  });
  clinicId = clinic.id;

  const hash = await hashPassword("senha123");
  await prisma.user.create({
    data: {
      email: "admin@test.com",
      passwordHash: hash,
      name: "Admin",
      role: "CLINIC_ADMIN",
      clinicId,
    },
  });
  await prisma.user.create({
    data: {
      email: "medico@test.com",
      passwordHash: hash,
      name: "Médico",
      role: "DOCTOR",
      clinicId,
    },
  });
  await prisma.user.create({
    data: {
      email: "paciente@test.com",
      passwordHash: hash,
      name: "Paciente",
      role: "PATIENT",
      clinicId,
    },
  });

  const login = async (email) => {
    const res = await request(app).post("/auth/login").send({
      email,
      password: "senha123",
    });
    expect(res.status).toBe(200);
    return res.body.token;
  };

  adminToken = await login("admin@test.com");
  doctorToken = await login("medico@test.com");
  patientToken = await login("paciente@test.com");
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("API pública", () => {
  it("GET /health", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it("GET /clinics lista clínicas", async () => {
    const res = await request(app).get("/clinics");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  it("GET /clinics/:id", async () => {
    const res = await request(app).get(`/clinics/${clinicId}`);
    expect(res.status).toBe(200);
    expect(res.body.name).toContain("Integração");
  });
});

describe("Auth", () => {
  it("login falha com senha errada", async () => {
    const res = await request(app).post("/auth/login").send({
      email: "admin@test.com",
      password: "errada",
    });
    expect(res.status).toBe(401);
  });

  it("POST /auth/register cria paciente", async () => {
    const res = await request(app).post("/auth/register").send({
      email: "novo.paciente@test.com",
      password: "senha12",
      name: "Novo Paciente",
      clinicId,
    });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe("PATIENT");
  });

  it("GET /me com token", async () => {
    const res = await request(app)
      .get("/me")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe("admin@test.com");
    expect(res.body.role).toBe("CLINIC_ADMIN");
  });
});

describe("Admin da clínica", () => {
  it("GET /admin/clinic", async () => {
    const res = await request(app)
      .get("/admin/clinic")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(clinicId);
  });

  it("PATCH /admin/clinic atualiza nome", async () => {
    const res = await request(app)
      .patch("/admin/clinic")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Clínica Atualizada QA" });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Clínica Atualizada QA");
  });

  it("POST /admin/doctors cria médico", async () => {
    const res = await request(app)
      .post("/admin/doctors")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        email: "novo.medico@test.com",
        password: "senha12",
        name: "Nova Doutora",
      });
    expect(res.status).toBe(201);
    expect(res.body.role).toBe("DOCTOR");
  });

  it("GET /admin/doctors lista médicos", async () => {
    const res = await request(app)
      .get("/admin/doctors")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(2);
  });

  it("GET /admin/patients lista pacientes", async () => {
    const res = await request(app)
      .get("/admin/patients")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.some((u) => u.role === "PATIENT")).toBe(true);
  });

  it("paciente não acede /admin/clinic", async () => {
    const res = await request(app)
      .get("/admin/clinic")
      .set("Authorization", `Bearer ${patientToken}`);
    expect(res.status).toBe(403);
  });
});

describe("Médico", () => {
  it("GET /doctor/me", async () => {
    const res = await request(app)
      .get("/doctor/me")
      .set("Authorization", `Bearer ${doctorToken}`);
    expect(res.status).toBe(200);
    expect(res.body.role).toBe("DOCTOR");
  });

  it("GET /doctor/patients lista pacientes da clínica", async () => {
    const res = await request(app)
      .get("/doctor/patients")
      .set("Authorization", `Bearer ${doctorToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.every((u) => u.role === "PATIENT")).toBe(true);
  });

  it("médico não acede /patient/me", async () => {
    const res = await request(app)
      .get("/patient/me")
      .set("Authorization", `Bearer ${doctorToken}`);
    expect(res.status).toBe(403);
  });
});

describe("Paciente", () => {
  it("GET /patient/me", async () => {
    const res = await request(app)
      .get("/patient/me")
      .set("Authorization", `Bearer ${patientToken}`);
    expect(res.status).toBe(200);
    expect(res.body.role).toBe("PATIENT");
  });

  it("GET /patient/clinic", async () => {
    const res = await request(app)
      .get("/patient/clinic")
      .set("Authorization", `Bearer ${patientToken}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(clinicId);
  });

  it("paciente não acede /doctor/patients", async () => {
    const res = await request(app)
      .get("/doctor/patients")
      .set("Authorization", `Bearer ${patientToken}`);
    expect(res.status).toBe(403);
  });
});

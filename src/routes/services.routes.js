// src/routes/services.routes.js
import { Router } from "express";
import { requireAuth } from "../middlewares/authz.js";
import { Service } from "../lib/databases.js";

const router = Router();

// ✅ GET /v1/services — lista los servicios disponibles
router.get("/", requireAuth, async (_req, res) => {
  try {
    const rows = await Service.findAll({ order: [["created_at", "ASC"]] });
    const data = rows.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description || "",
      price: Number(s.price),
    }));
    return res.json(data);
  } catch (err) {
    console.error("[GET /services]", err);
    return res.status(500).json({ error: "Failed to list services" });
  }
});

export default router;

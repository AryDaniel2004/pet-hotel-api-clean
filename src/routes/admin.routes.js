import { Router } from "express";
import { requireAuth, requireRoles } from "../middlewares/authz.js";
import { db, Room } from "../lib/databases.js";
import { QueryTypes } from "sequelize";

const router = Router();

/* ===========================================================
   🔹 Crear un nuevo servicio (bookingsdb.services)
=========================================================== */
router.post("/services", requireAuth, requireRoles("ADMIN"), async (req, res) => {
  try {
    const { name, description, price } = req.body || {};

    if (!name || !price) {
      return res.status(400).json({ error: "name y price son requeridos" });
    }

    const [service] = await db.book.query(
      `
      INSERT INTO services (id, name, description, price, created_at, updated_at)
      VALUES (gen_random_uuid(), :name, :description, :price, NOW(), NOW())
      RETURNING id, name, description, price, created_at
      `,
      {
        replacements: { name, description: description || null, price },
        type: QueryTypes.INSERT,
      }
    );

    return res.status(201).json(service);
  } catch (err) {
    console.error("[POST /admin/services]", err);
    return res.status(500).json({ error: "Error al crear servicio" });
  }
});

/* ===========================================================
   🔹 Actualizar precio de servicio existente
=========================================================== */
router.patch(
  "/services/:id",
  requireAuth,
  requireRoles("ADMIN"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { price } = req.body || {};

      if (!price) return res.status(400).json({ error: "price requerido" });

      const [row] = await db.book.query(
        `
        UPDATE services
        SET price = :price, updated_at = NOW()
        WHERE id = :id
        RETURNING id, name, price, updated_at
        `,
        { replacements: { id, price }, type: QueryTypes.UPDATE }
      );

      if (!row) return res.status(404).json({ error: "servicio no encontrado" });
      return res.json(row);
    } catch (err) {
      console.error("[PATCH /admin/services/:id]", err);
      return res.status(500).json({ error: "Error al actualizar servicio" });
    }
  }
);

/* ===========================================================
   🔹 Actualizar precio de habitación (inventorydb.rooms)
=========================================================== */
router.patch(
  "/rooms/:id/price",
  requireAuth,
  requireRoles("ADMIN"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { price } = req.body || {};

      if (!price) return res.status(400).json({ error: "price requerido" });

      const [row] = await db.inv.query(
        `
        UPDATE rooms
        SET base_rate = :price, updated_at = NOW()
        WHERE id = :id
        RETURNING id, code, base_rate AS price, updated_at
        `,
        { replacements: { id, price }, type: QueryTypes.UPDATE }
      );

      if (!row) return res.status(404).json({ error: "habitación no encontrada" });
      return res.json(row);
    } catch (err) {
      console.error("[PATCH /admin/rooms/:id/price]", err);
      return res.status(500).json({ error: "Error al actualizar habitación" });
    }
  }
);

export default router;

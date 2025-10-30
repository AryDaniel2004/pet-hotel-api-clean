// src/routes/rooms.routes.js
import { Router } from "express";
import { requireAuth } from "../middlewares/authz.js";
import { Room, RoomType, db } from "../lib/databases.js";
import { QueryTypes } from "sequelize";

const router = Router();

/* ===========================
   ✅ Listado de habitaciones
=========================== */
router.get("/", requireAuth, async (_req, res) => {
  try {
    const rooms = await Room.findAll({
      where: { status: "ACTIVE" },
      include: [
        {
          model: RoomType,
          attributes: ["name", "base_rate", "min_weight", "max_weight"],
        },
      ],
      order: [["code", "ASC"]],
    });

    const data = rooms.map((r) => ({
      id: r.id,
      code: r.code,
      type: r.RoomType?.name,
      price: Number(r.RoomType?.base_rate || 0),
    }));

    return res.json(data);
  } catch (err) {
    console.error("[GET /rooms]", err);
    return res.status(500).json({ error: "Failed to list rooms" });
  }
});

/* ===========================
   ✅ Disponibilidad (fechas bloqueadas)
   Corrige el origen de room_id (viene desde booking_items)
=========================== */
router.get("/availability", requireAuth, async (req, res) => {
  try {
    const { room_id } = req.query;
    if (!room_id)
      return res.status(400).json({ error: "room_id es requerido" });

    // Consulta usando JOIN a booking_items para obtener reservas confirmadas
    const data = await db.book.query(
      `
      SELECT b.start_date, b.end_date
      FROM bookings b
      INNER JOIN booking_items bi ON bi.booking_id = b.id
      WHERE bi.room_id = :room_id
        AND b.status = 'CONFIRMED'
      ORDER BY b.start_date ASC;
      `,
      {
        replacements: { room_id },
        type: QueryTypes.SELECT,
      }
    );

    return res.json(data);
  } catch (err) {
    console.error("[GET /rooms/availability]", err);
    return res
      .status(500)
      .json({ error: err.message || "Failed to load availability" });
  }
});

export default router;

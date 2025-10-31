// src/routes/bookings.routes.js
import { Router } from "express";
import { body, param, validationResult } from "express-validator";
import { Booking, BookingItem, BookingService } from "../lib/databases.js";
import { requireAuth } from "../middlewares/authz.js";
import { v4 as uuidv4 } from "uuid";
import { db } from "../lib/databases.js";
import { QueryTypes, Sequelize } from "sequelize";

const router = Router();


const validate = (rules) => [
  ...rules,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];


router.post(
  "/",
  requireAuth,
  validate([
    body("start_date").isISO8601(),
    body("end_date").isISO8601(),
    body("room_id").isUUID(),
    body("pet_id").isUUID(),
    body("services").optional().isArray(),
  ]),
  async (req, res) => {
    const t = await db.book.transaction();
    try {
      const user_id = req.user?.sub || req.user?.id;
      const { start_date, end_date, room_id, pet_id, services = [], notes } = req.body;

      if (!user_id) return res.status(401).json({ error: "Unauthorized" });

      
      const [roomResult] = await db.inv.query(
        `SELECT rt.base_rate AS price
         FROM rooms r
         JOIN room_types rt ON rt.id = r.room_type_id
         WHERE r.id = :id`,
        { replacements: { id: room_id }, type: QueryTypes.SELECT }
      );

      const roomPrice = Number(roomResult?.price) || 0;

      
      let servicesTotal = 0;
      let serviceDetails = [];

      if (services.length > 0) {
        const serviceRows = await db.book.query(
          `SELECT id, price FROM services WHERE id IN (:ids)`,
          { replacements: { ids: services }, type: db.book.QueryTypes.SELECT }
        );

        serviceDetails = serviceRows.map((s) => ({
          id: s.id,
          price: Number(s.price) || 0,
        }));

        servicesTotal = serviceDetails.reduce((sum, s) => sum + s.price, 0);
      }

      
      const total = roomPrice + servicesTotal;

      
      const booking = await Booking.create(
        {
          id: uuidv4(),
          customer_user_id: user_id,
          start_date,
          end_date,
          status: "PENDING",
          notes,
          total,
          created_at: new Date(),
          updated_at: new Date(),
        },
        { transaction: t }
      );

      
      const item = await BookingItem.create(
        {
          id: uuidv4(),
          booking_id: booking.id,
          room_id,
          pet_id,
          qty: 1,
          unit_price: roomPrice,
          created_at: new Date(),
          updated_at: new Date(),
        },
        { transaction: t }
      );

     
      if (serviceDetails.length > 0) {
        const serviceEntries = serviceDetails.map((s) => ({
          id: uuidv4(),
          booking_item_id: item.id,
          service_id: s.id,
          qty: 1,
          unit_price: s.price,
          created_at: new Date(),
          updated_at: new Date(),
        }));

        await BookingService.bulkCreate(serviceEntries, { transaction: t });
      }

      await t.commit();
      console.log(` Reserva creada ${booking.id} — Total: Q${total}`);
      return res.status(201).json({ ok: true, booking_id: booking.id, total });
    } catch (err) {
      await t.rollback();
      console.error(" [POST /bookings] Error interno:", err);
      return res.status(500).json({
        error: "Failed to create booking",
        details: err.message,
      });
    }
  }
);


router.get("/my", requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const bookings = await db.book.query(
      `
      SELECT 
        b.id AS booking_id,
        b.start_date,
        b.end_date,
        b.status,
        b.total,
        b.created_at
      FROM bookings b
      WHERE b.customer_user_id = :user
      ORDER BY b.created_at DESC
      `,
      { replacements: { user: userId }, type: Sequelize.QueryTypes.SELECT }
    );

    if (!bookings.length) return res.json([]);

    const items = await db.book.query(
      `SELECT booking_id, room_id FROM booking_items WHERE booking_id IN (:ids)`,
      {
        replacements: { ids: bookings.map(b => b.booking_id) },
        type: Sequelize.QueryTypes.SELECT
      }
    );

    const roomIds = items.map(i => i.room_id);
    const rooms = roomIds.length
      ? await db.inv.query(
          `
          SELECT r.id, r.code AS room_name, rt.name AS room_type_name
          FROM rooms r
          JOIN room_types rt ON rt.id = r.room_type_id
          WHERE r.id IN (:ids)
          `,
          { replacements: { ids: roomIds }, type: Sequelize.QueryTypes.SELECT }
        )
      : [];

    const result = bookings.map(b => {
      const it = items.find(i => i.booking_id === b.booking_id);
      const room = rooms.find(r => r.id === it?.room_id);
      return {
        id: b.booking_id, 
        start_date: b.start_date,
        end_date: b.end_date,
        status: b.status,
        total: b.total,
        created_at: b.created_at,
        room_name: room?.room_name ?? null,
        room_type_name: room?.room_type_name ?? null,
      };
    });

    res.json(result);
  } catch (err) {
    console.error(" [GET /bookings/my]", err);
    res.status(500).json({ error: "Failed to list bookings" });
  }
});


router.patch(
  "/:id/status",
  requireAuth,
  validate([
    param("id").isUUID(),
    body("status").isIn(["PENDING", "CONFIRMED", "CANCELLED"]),
  ]),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const booking = await Booking.findByPk(id);
      if (!booking) return res.status(404).json({ error: "Booking not found" });

      booking.status = status;
      await booking.save();

      console.log(` Estado de reserva ${id} cambiado a ${status}`);
      return res.json({ ok: true, id, status });
    } catch (err) {
      console.error(" [PATCH /bookings/:id/status]", err);
      return res.status(500).json({ error: "Failed to update status" });
    }
  }
);


router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user?.sub || req.user?.id;

    const booking = await Booking.findByPk(id);
    if (!booking) return res.status(404).json({ error: "Booking not found" });

    if (booking.customer_user_id !== user_id && req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const items = await BookingItem.findAll({
      where: { booking_id: id },
      attributes: ["id"],
    });

    const itemIds = items.map((i) => i.id);

    if (itemIds.length > 0) {
      await BookingService.destroy({ where: { booking_item_id: itemIds } });
    }

    await BookingItem.destroy({ where: { booking_id: id } });
    await Booking.destroy({ where: { id } });

    console.log(" Reserva eliminada correctamente:", id);
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(" [DELETE /bookings/:id]", err);
    return res.status(500).json({
      error: "Failed to delete booking",
      details: err.message,
    });
  }
});

export default router;

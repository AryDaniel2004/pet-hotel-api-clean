import { Booking, BookingItem, BookingService, Service } from "../lib/databases.js";
import { v4 as uuidv4 } from "uuid";

/**
 * Crear una reserva (Booking) con items y servicios
 */
export const createBooking = async (req, res) => {
  try {
    const user_id = req.user?.id; // ✅ viene del middleware corregido
    if (!user_id) {
      console.error("❌ [POST /bookings] Usuario sin ID en req.user:", req.user);
      return res.status(401).json({ error: "Unauthorized" });
    }

    console.log("🟢 [POST /bookings] Payload recibido:", req.body);

    const { start_date, end_date, room_id, pet_id, services = [], notes } = req.body;

    if (!start_date || !end_date || !room_id || !pet_id) {
      return res.status(400).json({ error: "Campos obligatorios faltantes" });
    }

    // 🔹 Crear Booking principal
    const booking = await Booking.create({
      id: uuidv4(),
      customer_user_id: user_id, // ✅ campo correcto
      start_date,
      end_date,
      status: "PENDING",
      notes,
      created_at: new Date(),
      updated_at: new Date(),
    });

    console.log("✅ Booking creado:", booking.id);

    // 🔹 Crear BookingItem (habitación + mascota)
    const item = await BookingItem.create({
      id: uuidv4(),
      booking_id: booking.id,
      room_id,
      pet_id,
      created_at: new Date(),
      updated_at: new Date(),
    });

    console.log("✅ BookingItem creado:", item.id);

    // 🔹 Crear servicios asociados (si los hay)
    for (const sid of services) {
      await BookingService.create({
        id: uuidv4(),
        booking_id: booking.id,
        service_id: sid,
        created_at: new Date(),
        updated_at: new Date(),
      });
    }

    console.log("✅ Servicios asociados creados:", services.length);

    return res.status(201).json({ ok: true, booking_id: booking.id });
  } catch (err) {
    console.error("❌ [POST /bookings] Error interno:", err);
    return res.status(500).json({ error: "Failed to create booking", details: err.message });
  }
};

/**
 * Listar reservas del usuario autenticado
 */
export const listMyBookings = async (req, res) => {
  try {
    const user_id = req.user?.id;
    if (!user_id) {
      console.error("❌ [GET /bookings/my] Usuario sin ID:", req.user);
      return res.status(401).json({ error: "Unauthorized" });
    }

    console.log("🟢 [GET /bookings/my] Listando reservas para usuario:", user_id);

    const rows = await Booking.findAll({
      where: { customer_user_id: user_id }, // ✅ Campo correcto
      include: [
        {
          model: BookingItem,
          attributes: ["room_id", "pet_id"],
        },
        {
          model: BookingService,
          include: [{ model: Service, attributes: ["name", "price"] }],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    console.log(`✅ Se encontraron ${rows.length} reservas`);
    return res.json(rows);
  } catch (err) {
    console.error("❌ [GET /bookings/my] Error interno:", err);
    return res.status(500).json({
      error: "Failed to list bookings",
      details: err.message,
    });
  }
};



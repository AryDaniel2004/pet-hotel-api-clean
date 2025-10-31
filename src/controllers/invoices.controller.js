import { Sequelize } from "sequelize";
import { db } from "../lib/databases.js";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

/**
 * 
 * Body: { booking_id, nit? }
 */
export const createInvoiceFromBooking = async (req, res) => {
  const t = await db.book.transaction();
  try {
    const { booking_id, nit } = req.body || {};
    if (!booking_id)
      return res.status(400).json({ error: "booking_id required" });

   
    const [booking] = await db.book.query(
      `
      SELECT b.id, b.customer_user_id, b.start_date, b.end_date,
             b.total, b.status,
             u.full_name, u.email, u.address,
             rt.name AS room_type_name, r.name AS room_name
      FROM bookings b
      JOIN booking_items bi ON bi.booking_id = b.id
      JOIN rooms r ON r.id = bi.room_id
      JOIN room_types rt ON rt.id = r.room_type_id
      JOIN authdb.users u ON u.id = b.customer_user_id
      WHERE b.id = :id
      LIMIT 1
      `,
      {
        replacements: { id: booking_id },
        type: Sequelize.QueryTypes.SELECT,
        transaction: t,
      }
    );

    if (!booking) {
      await t.rollback();
      return res.status(404).json({ error: "booking not found" });
    }

    if (booking.status !== "CONFIRMED") {
      await t.rollback();
      return res
        .status(400)
        .json({ error: "Booking is not confirmed or paid" });
    }

    // Buscar el último pago (por referencia)
    const [pay] = await db.book.query(
      `
      SELECT id, status, provider_ref
      FROM payments
      WHERE booking_id = :id
      ORDER BY created_at DESC
      LIMIT 1
      `,
      {
        replacements: { id: booking_id },
        type: Sequelize.QueryTypes.SELECT,
        transaction: t,
      }
    );

    // Factura (Ya no lo voy aplicar)
    const [inv] = await db.book.query(
      `
      INSERT INTO invoices
        (id, booking_id, user_id, payment_id, issue_date,
         total, nit, customer_name, status, created_at, updated_at)
      VALUES
        (gen_random_uuid(), :booking_id, :user_id, :payment_id, NOW(),
         :total, :nit, :customer, 'ISSUED', NOW(), NOW())
      RETURNING id
      `,
      {
        replacements: {
          booking_id,
          user_id: booking.customer_user_id,
          payment_id: pay?.id || null,
          total: booking.total || 0,
          nit: nit || "CF",
          customer: booking.full_name,
        },
        type: Sequelize.QueryTypes.INSERT,
        transaction: t,
      }
    );

    const invoice_id = inv?.id || inv?.[0]?.id || inv;

    //  Insertar items
    await db.book.query(
      `
      INSERT INTO invoice_items (id, invoice_id, description, qty, unit_price, total, created_at, updated_at)
      VALUES (gen_random_uuid(), :invoice_id, :desc, 1, :unit_price, :total, NOW(), NOW())
      `,
      {
        replacements: {
          invoice_id,
          desc: `Alojamiento: ${booking.room_name} (${booking.room_type_name})`,
          unit_price: booking.total,
          total: booking.total,
        },
        type: Sequelize.QueryTypes.INSERT,
        transaction: t,
      }
    );

    await t.commit();

    res.status(201).json({
      ok: true,
      invoice_id,
      message: "Invoice created successfully",
    });
  } catch (e) {
    console.error("[createInvoiceFromBooking]", e);
    await t.rollback();
    res.status(500).json({ error: "create invoice failed" });
  }
};

/**
 *  Generacion de Facturas para PDFS (NO SE VA INTREGRAR)
 */
export const getInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    const [invoice] = await db.book.query(
      `
      SELECT i.id, i.nit, i.total, i.created_at, i.customer_name,
             b.start_date, b.end_date, b.id AS booking_id,
             r.name AS room_name, rt.name AS room_type_name
      FROM invoices i
      JOIN bookings b ON b.id = i.booking_id
      JOIN booking_items bi ON bi.booking_id = b.id
      JOIN rooms r ON r.id = bi.room_id
      JOIN room_types rt ON rt.id = r.room_type_id
      WHERE i.id = :id
      `,
      { replacements: { id }, type: Sequelize.QueryTypes.SELECT }
    );

    if (!invoice) return res.status(404).json({ error: "Invoice not found" });

    // === Crear PDF ===
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=factura-${invoice.id}.pdf`
    );

    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);

    //  Logo y encabezado 
    const logoPath = path.resolve("assets/logo.png");
    if (fs.existsSync(logoPath)) doc.image(logoPath, 50, 45, { width: 80 });

    doc
      .fontSize(20)
      .text("Huellas & Relax", 140, 50)
      .fontSize(10)
      .text("Hotel para Mascotas", 140, 70)
      .text("www.huellasrelax.com", 140, 85)
      .moveDown(2);

    //  Datos del cliente 
    doc
      .fontSize(12)
      .text(`Factura No: ${invoice.id}`)
      .text(`Fecha de emisión: ${new Date(invoice.created_at).toLocaleDateString()}`)
      .text(`Cliente: ${invoice.customer_name}`)
      .text(`NIT: ${invoice.nit}`)
      .moveDown(1);

    // DetalleS 
    doc
      .fontSize(14)
      .text("Detalle de la reserva", { underline: true })
      .moveDown(0.5);

    doc
      .fontSize(12)
      .text(`Reserva ID: ${invoice.booking_id}`)
      .text(`Habitación: ${invoice.room_name} (${invoice.room_type_name})`)
      .text(`Fechas: ${invoice.start_date} → ${invoice.end_date}`)
      .moveDown(1);

    doc
      .fontSize(13)
      .text(`Total: Q${Number(invoice.total).toFixed(2)}`, { align: "right" })
      .moveDown(2);

    doc
      .fontSize(10)
      .text("Gracias por confiar en Huellas & Relax 🐾", { align: "center" });

    doc.end();
  } catch (e) {
    console.error("[getInvoice]", e);
    res.status(500).json({ error: "get invoice failed" });
  }
};


export const listInvoices = async (req, res) => {
  try {
    const { booking_id } = req.query;

    const rows = await db.book.query(
      `
      SELECT * FROM invoices
      WHERE (:booking_id::uuid IS NULL OR booking_id = :booking_id)
      ORDER BY created_at DESC
      `,
      {
        replacements: { booking_id: booking_id || null },
        type: Sequelize.QueryTypes.SELECT,
      }
    );

    res.json(rows);
  } catch (e) {
    console.error("[listInvoices]", e);
    res.status(500).json({ error: "list invoices failed" });
  }
};

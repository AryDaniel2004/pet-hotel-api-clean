// src/controllers/payments.controller.js
import Stripe from "stripe";
import { Sequelize } from "sequelize";
import { db } from "../lib/databases.js";

const stripe = new Stripe(process.env.STRIPE_SECRET);


export const createPaymentIntent = async (req, res) => {
  try {
    const { booking_id } = req.body || {};
    if (!booking_id)
      return res.status(400).json({ error: "booking_id is required" });

    // Buscar booking
    const [booking] = await db.book.query(
      `SELECT id, total, status FROM bookings WHERE id = :id LIMIT 1`,
      {
        replacements: { id: booking_id },
        type: Sequelize.QueryTypes.SELECT,
      }
    );
    if (!booking) return res.status(404).json({ error: "booking not found" });
    if (booking.status === "CANCELLED")
      return res.status(400).json({ error: "booking cancelled" });

    const amount = Math.round(Number(booking.total || 0) * 100);
    const currency = process.env.STRIPE_CURRENCY || "usd";

    // Crear registro en payments
    const [payment] = await db.book.query(
      `INSERT INTO payments (id, booking_id, amount, status, provider_ref, currency, created_at)
       VALUES (gen_random_uuid(), :booking_id, :amount, 'PENDING', NULL, :currency, NOW())
       RETURNING id`,
      {
        replacements: { booking_id, amount: booking.total, currency },
        type: Sequelize.QueryTypes.INSERT,
      }
    );

    const payment_id =
      payment?.id || payment?.[0]?.id || payment?.[0]?.id || payment;

    // Crear PaymentIntent
    const pi = await stripe.paymentIntents.create({
      amount,
      currency,
      metadata: { booking_id, payment_id },
      automatic_payment_methods: { enabled: true },
    });

    // Guardar provider_ref
    await db.book.query(
      `UPDATE payments SET provider_ref = :pi_id, updated_at = NOW()
       WHERE id = :payment_id`,
      {
        replacements: { pi_id: pi.id, payment_id },
        type: Sequelize.QueryTypes.UPDATE,
      }
    );

    return res.json({
      payment_id,
      client_secret: pi.client_secret,
      amount: booking.total,
      currency,
    });
  } catch (e) {
    console.error("[createPaymentIntent]", e);
    res.status(500).json({ error: "create payment intent failed" });
  }
};


export const confirmIntentTest = async (req, res) => {
  try {
    if (process.env.NODE_ENV !== "development")
      return res.status(403).json({ error: "forbidden in non-dev" });

    const { payment_intent_id } = req.body || {};
    if (!payment_intent_id)
      return res.status(400).json({ error: "payment_intent_id is required" });

    const pi = await stripe.paymentIntents.confirm(payment_intent_id, {
      payment_method: "pm_card_visa",
    });

    return res.json({ ok: true, status: pi.status, id: pi.id });
  } catch (e) {
    console.error("[confirmIntentTest]", e);
    res.status(500).json({ error: "confirm intent failed" });
  }
};

/**
 * Webhook Stripe
 */
export const stripeWebhook = async (req, res) => {
  try {
    const sig = req.headers["stripe-signature"];
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, secret);
    } catch (err) {
      console.error("[webhook] invalid signature", err?.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "payment_intent.succeeded") {
      const pi = event.data.object;
      const payment_id = pi.metadata?.payment_id;
      const booking_id = pi.metadata?.booking_id;

      await db.book.query(
        `UPDATE payments SET status='PAID', updated_at=NOW()
         WHERE provider_ref = :pi_id OR id = :payment_id`,
        {
          replacements: { pi_id: pi.id, payment_id },
          type: Sequelize.QueryTypes.UPDATE,
        }
      );

      // Después de guardar el pago o al confirmar el intent
await db.book.query(
  `
  UPDATE bookings
  SET status = 'CONFIRMED'
  WHERE id = :booking_id
  `,
  {
    replacements: { booking_id },
    type: Sequelize.QueryTypes.UPDATE
  }
);


      console.log("[webhook] booking confirmed", booking_id);
    }

    if (event.type === "payment_intent.payment_failed") {
      const pi = event.data.object;
      const payment_id = pi.metadata?.payment_id;

      await db.book.query(
        `UPDATE payments SET status='FAILED', updated_at=NOW()
         WHERE provider_ref = :pi_id OR id = :payment_id`,
        {
          replacements: { pi_id: pi.id, payment_id },
          type: Sequelize.QueryTypes.UPDATE,
        }
      );

      console.log("[webhook] payment failed", payment_id);
    }

    res.json({ received: true });
  } catch (e) {
    console.error("[stripeWebhook]", e);
    res.status(500).json({ error: "webhook failed" });
  }
};

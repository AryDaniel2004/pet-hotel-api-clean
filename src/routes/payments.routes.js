// src/routes/payments.routes.js
import { Router } from "express";
import { body, validationResult } from "express-validator";
import {
  createPaymentIntent,
  confirmIntentTest,
  stripeWebhook,
} from "../controllers/payments.controller.js";

const router = Router();

const validate = (rules = []) => [
  ...rules,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.warn("[ Validation Error]", errors.array());
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];


router.post(
  "/intent",
  validate([body("booking_id").isUUID().withMessage("booking_id debe ser UUID válido")]),
  async (req, res, next) => {
    console.log(" [POST /v1/payments/intent] Body recibido:", req.body);
    next(); 
  },
  createPaymentIntent
);


router.post(
  "/intent/confirm-test",
  validate([body("payment_intent_id").isString().notEmpty().withMessage("payment_intent_id requerido")]),
  confirmIntentTest
);


router.post("/webhook", stripeWebhook);

export default router;

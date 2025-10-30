import { Router } from 'express';
import { body, validationResult, query, param } from 'express-validator';
import { createInvoiceFromBooking, getInvoice, listInvoices } from '../controllers/invoices.controller.js';

const router = Router();

const validate = (rules) => [...rules, (req,res,next)=>{
  const e = validationResult(req);
  if (!e.isEmpty()) return res.status(400).json({ errors: e.array() });
  next();
}];

router.post(
  '/invoices/from-booking',
  validate([ body('booking_id').isUUID() ]),
  createInvoiceFromBooking
);

router.get(
  '/invoices',
  validate([ query('booking_id').optional().isUUID() ]),
  listInvoices
);

router.get(
  '/invoices/:id',
  validate([ param('id').isUUID() ]),
  getInvoice
);

export default router;

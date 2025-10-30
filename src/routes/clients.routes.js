import { Router } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import {
  createClient,
  listClients,
  getClient,
  updateClient,
  deleteClient,
} from '../controllers/clients.controller.js';

const router = Router();

const validate = (rules) => [
  ...rules,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
];

router.post(
  '/clients',
  validate([
    body('user_id').isUUID(),
    body('full_name').isString().isLength({ min: 2 }),
    body('phone').optional().isString(),
    body('address').optional().isString(),
  ]),
  createClient
);

router.get(
  '/clients',
  validate([
    query('q').optional().isString(),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('offset').optional().isInt({ min: 0 }),
  ]),
  listClients
);

router.get('/clients/:id', validate([param('id').isUUID()]), getClient);

router.put(
  '/clients/:id',
  validate([
    param('id').isUUID(),
    body('full_name').optional().isString(),
    body('phone').optional().isString(),
    body('address').optional().isString(),
  ]),
  updateClient
);

router.delete('/clients/:id', validate([param('id').isUUID()]), deleteClient);

export default router;

// src/routes/auth.routes.js
import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { login, refresh, logout, registerPublic, me } from '../controllers/auth.controller.js';
import { requireAuth } from '../middlewares/authz.js';

const router = Router();

const validate = (rules) => [
  ...rules,
  (req, res, next) => {
    const e = validationResult(req);
    if (!e.isEmpty()) return res.status(400).json({ errors: e.array() });
    next();
  }
];

// Registro público
router.post(
  '/register',
  validate([
    body('full_name').isString().isLength({ min: 3 }),
    body('dpi').isString().isLength({ min: 6 }),
    body('phone').isString().isLength({ min: 3 }),
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    body('address').optional().isString()
  ]),
  registerPublic
);

// Login / Refresh / Logout
router.post('/login',
  validate([ body('email').isEmail(), body('password').isString() ]),
  login
);
router.post('/refresh',
  validate([ body('refreshToken').isString() ]),
  refresh
);
router.post('/logout',
  validate([ body('refreshToken').isString() ]),
  logout
);

// Usuario actual
router.get('/me', requireAuth, me);

export default router;

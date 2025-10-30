// src/routes/users.routes.js
import { Router } from "express";
import { body, param, validationResult } from "express-validator";
import {
  list,
  create,
  deactivate,
  getUser,
  updateUser,
} from "../controllers/users.controller.js";
import { requireAuth, requireRoles } from "../middlewares/authz.js";

const router = Router();

/* Middleware de validación */
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

/* === Rutas === */
router.get("/", requireAuth, requireRoles(), list);

router.post(
  "/",
  requireAuth,
  requireRoles(),
  validate([
    body("full_name").isString().notEmpty(),
    body("dpi").isString().notEmpty(),
    body("phone").isString().notEmpty(),
    body("email").isEmail(),
    body("password").isLength({ min: 6 }),
    body("role").optional().isIn(["ADMIN", "CUSTOMER", "CLIENT"]),
  ]),
  create
);

router.get(
  "/:id",
  requireAuth,
  requireRoles(),
  validate([param("id").isUUID()]),
  getUser
);

router.put(
  "/:id",
  requireAuth,
  requireRoles(),
  validate([
    param("id").isUUID(),
    body("email").optional().isEmail(),
    body("full_name").optional().isString(),
    body("phone").optional().isString(),
    body("dpi").optional().isString(),
    body("role").optional().isIn(["ADMIN", "CUSTOMER", "CLIENT"]),
  ]),
  updateUser
);

router.delete(
  "/:id",
  requireAuth,
  requireRoles(),
  validate([param("id").isUUID()]),
  deactivate
);

export default router;

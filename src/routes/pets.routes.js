// src/routes/pets.routes.js
import { Router } from "express";
import { body, param, validationResult } from "express-validator";
import multer from "multer";
import path from "path";
import {
  createPet,
  listMyPets,
  getPet,
  updatePet,
  deletePet,
} from "../controllers/pets.controller.js";
import { requireAuth, requireRoles } from "../middlewares/authz.js";
import { Pet } from "../lib/databases.js"; 

const router = Router();


const validate = (rules) => [
  ...rules,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });
    next();
  },
];

// ================= RUTAS CRUD =================

router.get("/my", requireAuth, requireRoles("ADMIN", "CUSTOMER"), listMyPets);

router.post(
  "/",
  requireAuth,
  requireRoles("ADMIN", "CUSTOMER"),
  validate([
    body("name").isString().isLength({ min: 2 }),
    body("species").isString(),
    body("breed").optional().isString(),
    body("weight_kg").optional().isFloat({ gt: 0 }),
    body("photo_url").optional().isString(),
  ]),
  createPet
);


router.get(
  "/:id",
  requireAuth,
  requireRoles("ADMIN", "CUSTOMER"),
  validate([param("id").isUUID()]),
  getPet
);


router.put(
  "/:id",
  requireAuth,
  requireRoles("ADMIN", "CUSTOMER"),
  validate([
    param("id").isUUID(),
    body("name").optional().isString(),
    body("species").optional().isString(),
    body("breed").optional().isString(),
    body("weight_kg").optional().isFloat({ gt: 0 }),
    body("photo_url").optional().isString(),
  ]),
  updatePet
);


router.delete(
  "/:id",
  requireAuth,
  requireRoles("ADMIN", "CUSTOMER"),
  validate([param("id").isUUID()]),
  deletePet
);

// FOTOS 
const storage = multer.diskStorage({
  destination: "uploads/pets/", 
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });


router.post(
  "/upload-photo",
  requireAuth,
  requireRoles("ADMIN", "CUSTOMER"),
  upload.single("photo"),
  async (req, res) => {
    try {
      const { pet_id } = req.body;

      if (!pet_id) {
        return res.status(400).json({ error: "Falta el ID de la mascota" });
      }
      if (!req.file) {
        return res.status(400).json({ error: "No se envió ninguna foto" });
      }

      const photoUrl = `/uploads/pets/${req.file.filename}`;

      await Pet.update({ photo_url: photoUrl }, { where: { id: pet_id } });

      res.json({ success: true, url: photoUrl });
    } catch (err) {
      console.error(" Error al subir foto:", err);
      res.status(500).json({ error: "Error interno al subir la foto" });
    }
  }
);

export default router;

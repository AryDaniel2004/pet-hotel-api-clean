// src/controllers/pets.controller.js
import { Op } from "sequelize";
import { Pet } from "../lib/databases.js";

// 🐾 Crear una mascota asociada al usuario autenticado
export const createPet = async (req, res) => {
  try {
    const { name, species, breed, weight_kg, photo_url } = req.body || {};
    const owner_user_id = req.user?.id; // ✅ Corregido (antes era sub)

    if (!owner_user_id) {
      return res.status(401).json({ error: "unauthorized" });
    }

    const newPet = await Pet.create({
      owner_user_id,
      name,
      species,
      breed,
      weight_kg,
      photo_url,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return res.status(201).json(newPet);
  } catch (e) {
    console.error("[createPet]", e);
    return res.status(500).json({ error: "create pet failed" });
  }
};

// 🐾 Listar solo las mascotas del usuario autenticado
export const listMyPets = async (req, res) => {
  try {
    const owner_user_id = req.user?.id; // ✅ corregido
    if (!owner_user_id) return res.status(401).json({ error: "unauthorized" });

    const rows = await Pet.findAll({
      where: { owner_user_id },
      order: [["created_at", "DESC"]],
    });

    return res.json(rows);
  } catch (e) {
    console.error("[listMyPets]", e);
    return res.status(500).json({ error: "list pets failed" });
  }
};

// 🐾 Obtener una mascota específica del usuario
export const getPet = async (req, res) => {
  try {
    const owner_user_id = req.user?.id; // ✅ corregido
    const pet = await Pet.findByPk(req.params.id);

    if (!pet || pet.owner_user_id !== owner_user_id) {
      return res.status(404).json({ error: "not found" });
    }

    return res.json(pet);
  } catch (e) {
    console.error("[getPet]", e);
    return res.status(500).json({ error: "get pet failed" });
  }
};

// 🐾 Actualizar una mascota del usuario
export const updatePet = async (req, res) => {
  try {
    const owner_user_id = req.user?.id; // ✅ corregido
    const pet = await Pet.findByPk(req.params.id);

    if (!pet || pet.owner_user_id !== owner_user_id) {
      return res.status(404).json({ error: "not found" });
    }

    const { name, species, breed, weight_kg, photo_url } = req.body || {};
    await pet.update({
      name,
      species,
      breed,
      weight_kg,
      photo_url,
      updated_at: new Date(),
    });

    return res.json(pet);
  } catch (e) {
    console.error("[updatePet]", e);
    return res.status(500).json({ error: "update pet failed" });
  }
};

// 🐾 Eliminar mascota del usuario
export const deletePet = async (req, res) => {
  try {
    const owner_user_id = req.user?.id; // ✅ corregido
    const pet = await Pet.findByPk(req.params.id);

    if (!pet || pet.owner_user_id !== owner_user_id) {
      return res.status(404).json({ error: "not found" });
    }

    await pet.destroy();
    return res.json({ ok: true });
  } catch (e) {
    console.error("[deletePet]", e);
    return res.status(500).json({ error: "delete pet failed" });
  }
};

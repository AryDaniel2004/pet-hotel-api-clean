// src/controllers/pets.controller.js
import { Op } from "sequelize";
import { Pet } from "../lib/databases.js";

// Crear la mascota 
export const createPet = async (req, res) => {
  try {
    const { name, species, breed, weight_kg, photo_url } = req.body || {};
    const owner_user_id = req.user?.id; 

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

// Lista Mascotas solo del Usuario que inicio sesion
export const listMyPets = async (req, res) => {
  try {
    const owner_user_id = req.user?.id; 
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

// Get de las mascotas que tiene el usuario
export const getPet = async (req, res) => {
  try {
    const owner_user_id = req.user?.id; 
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

// Actulizacion de las mascotas 
export const updatePet = async (req, res) => {
  try {
    const owner_user_id = req.user?.id; 
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

// Eliminar a una de las mascotas 
export const deletePet = async (req, res) => {
  try {
    const owner_user_id = req.user?.id; 
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

// src/server.js
import "dotenv/config";
import express from "express";
import app from "./app.js";
import listEndpoints from "express-list-endpoints";
import path from "path";
import { fileURLToPath } from "url";

// === Necesario para resolver rutas en ESM ===
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// === Configuración general ===
const PORT = process.env.PORT || 3001;
const HOST = "0.0.0.0"; // Render necesita esto

// ✅ Ruta absoluta hacia uploads (está en apps/api/uploads)
const uploadsPath = path.resolve(__dirname, "../uploads");

// ✅ Servir archivos estáticos (fotos de mascotas y usuarios)
app.use("/uploads", express.static(uploadsPath));

// Mostrar rutas (opcional)
console.table(listEndpoints(app));

// Iniciar servidor
app.listen(PORT, HOST, () => {
  console.log(`[api] Servidor escuchando en http://${HOST}:${PORT}`);
  console.log(`[api] Archivos estáticos servidos desde: ${uploadsPath}`);
});

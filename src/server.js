// src/server.js
import "dotenv/config";
import express from "express";
import app from "./app.js";
import listEndpoints from "express-list-endpoints";

const PORT = process.env.PORT || 3001;
const HOST = "0.0.0.0"; // 🔥 Necesario para Render

// Servir archivos estáticos
app.use("/uploads", express.static("uploads"));

// Mostrar rutas disponibles en consola
console.table(listEndpoints(app));

// Iniciar servidor
app.listen(PORT, HOST, () => {
  console.log(`[api] Servidor escuchando en puerto ${PORT}`);
  console.log(`[api] Entorno: ${process.env.NODE_ENV}`);
});

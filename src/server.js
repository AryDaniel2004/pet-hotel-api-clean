// src/server.js
import "dotenv/config";
import express from "express";
import app from "./app.js";
import listEndpoints from "express-list-endpoints";


const PORT = process.env.PORT || 3001;

// ✅ Servir archivos estáticos
app.use("/uploads", express.static("uploads"));

console.table(listEndpoints(app));

app.listen(PORT, () => {
  console.log(`[api] http://localhost:${PORT}`);
});

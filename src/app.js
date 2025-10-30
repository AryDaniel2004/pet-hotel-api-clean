// src/app.js
import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import usersRoutes from "./routes/users.routes.js";
import availabilityRoutes from "./routes/availability.routes.js";
import roomBlocksRoutes from "./routes/room-blocks.routes.js";
import bookingsRoutes from "./routes/bookings.routes.js";
import clientsRoutes from "./routes/clients.routes.js";
import petsRoutes from "./routes/pets.routes.js";
import servicesRoutes from "./routes/services.routes.js";
import paymentsRoutes from "./routes/payments.routes.js";
import roomsRoutes from "./routes/rooms.routes.js";
import adminRoutes from "./routes/admin.routes.js";

const app = express();

// =============================
// 🌐 Configuración CORS global
// =============================
const allowedOrigins = [
  "https://huellas-relax-frontend.onrender.com", // 🌍 Frontend Render
  "http://localhost:3000", // 💻 Local
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS bloqueado para este origen: " + origin));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// =============================
// 🧰 Middlewares globales
// =============================
app.use(helmet());
app.use(morgan("dev"));
app.use(
  express.json({
    verify: (req, res, buf) => {
      // Solo el webhook de Stripe necesita rawBody
      if (req.originalUrl === "/v1/payments/webhook") {
        req.rawBody = buf.toString();
      }
    },
  })
);

// =============================
// 🩺 Ruta de salud
// =============================
app.get("/v1/health", (_req, res) =>
  res.json({
    ok: true,
    environment: process.env.NODE_ENV || "development",
    api: "pet-hotel-api",
  })
);

// =============================
// 🧩 Rutas principales
// =============================
app.use("/v1/auth", authRoutes);
app.use("/v1/users", usersRoutes);
app.use("/v1/clients", clientsRoutes);
app.use("/v1/availability", availabilityRoutes);
app.use("/v1/room-blocks", roomBlocksRoutes);
app.use("/v1/rooms", roomsRoutes);
app.use("/v1/pets", petsRoutes);
app.use("/v1/bookings", bookingsRoutes);
app.use("/v1/services", servicesRoutes);
app.use("/v1/payments", paymentsRoutes);
app.use("/v1/admin", adminRoutes);

export default app;

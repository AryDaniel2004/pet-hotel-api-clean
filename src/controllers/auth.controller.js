// src/controllers/auth.controller.js
import {
  hashPassword,
  verifyPassword,
  signAccessToken,
  signRefreshToken,
} from "../lib/auth.js";
import { User, RefreshToken } from "../lib/databases.js";

/* ==========================
   REGISTRO PÚBLICO (CUSTOMER)
========================== */
export const registerPublic = async (req, res) => {
  try {
    const { full_name, dpi, phone, email, password } = req.body || {};

    // Validaciones básicas
    if (!full_name || !dpi || !phone || !email || !password) {
      return res
        .status(400)
        .json({ error: "Campos requeridos: full_name, dpi, phone, email, password" });
    }

    // Validar duplicado
    const exists = await User.findOne({ where: { email } });
    if (exists) {
      return res.status(409).json({ error: "El correo ya está registrado" });
    }

    // Crear usuario con rol CUSTOMER
    const passwordHash = await hashPassword(password);
    const user = await User.create({
      full_name,
      dpi,
      phone,
      email,
      password: passwordHash,
      role: "CUSTOMER",
      created_at: new Date(),
      updated_at: new Date(),
    });

    // Generar tokens
    const accessToken = signAccessToken({ sub: user.id, role: user.role });
    const refreshToken = signRefreshToken({ sub: user.id, role: user.role });
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); // 30 días

    await RefreshToken.create({
      user_id: user.id,
      token: refreshToken,
      expires_at: expiresAt,
      created_at: new Date(),
    });

    return res.status(201).json({
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    console.error("[auth.registerPublic]", err);
    return res.status(500).json({ error: "Error al registrar usuario" });
  }
};

/* ==========================
   LOGIN
========================== */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    // Buscar usuario
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    // Validar contraseña
    const valid = await verifyPassword(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: "Credenciales inválidas" });
    }

    // Generar tokens
    const accessToken = signAccessToken({ sub: user.id, role: user.role });
    const refreshToken = signRefreshToken({ sub: user.id, role: user.role });
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);

    await RefreshToken.create({
      user_id: user.id,
      token: refreshToken,
      expires_at: expiresAt,
      created_at: new Date(),
    });

    return res.status(200).json({
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
      },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    console.error("[auth.login]", err);
    return res.status(500).json({ error: "Error al iniciar sesión" });
  }
};

/* ==========================
   REFRESH TOKEN
========================== */
export const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body || {};
    if (!refreshToken) {
      return res.status(400).json({ error: "refreshToken requerido" });
    }

    const row = await RefreshToken.findOne({ where: { token: refreshToken } });
    if (!row) return res.status(401).json({ error: "refreshToken inválido" });
    if (row.revoked_at)
      return res.status(401).json({ error: "refreshToken revocado" });
    if (new Date(row.expires_at) < new Date()) {
      return res.status(401).json({ error: "refreshToken expirado" });
    }

    const user = await User.findByPk(row.user_id);
    if (!user) return res.status(401).json({ error: "Usuario no encontrado" });

    const newAccess = signAccessToken({ sub: user.id, role: user.role });
    return res.status(200).json({ accessToken: newAccess });
  } catch (err) {
    console.error("[auth.refresh]", err);
    return res.status(500).json({ error: "Error al refrescar token" });
  }
};

/* ==========================
   LOGOUT
========================== */
export const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body || {};
    if (!refreshToken)
      return res.status(400).json({ error: "refreshToken requerido" });

    const [n] = await RefreshToken.update(
      { revoked_at: new Date() },
      { where: { token: refreshToken } }
    );

    if (!n) {
      return res.status(404).json({ error: "refreshToken no encontrado" });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("[auth.logout]", err);
    return res.status(500).json({ error: "Error al cerrar sesión" });
  }
};

/* ==========================
   PERFIL (ME)
========================== */
export const me = async (req, res) => {
  try {
    const uid = req.user?.id || req.user?.sub;
    if (!uid) return res.status(401).json({ error: "No autorizado" });

    const user = await User.findByPk(uid, {
      attributes: [
        "id",
        "full_name",
        "dpi",
        "phone",
        "email",
        "role",
        "created_at",
        "updated_at",
      ],
    });

    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });
    return res.status(200).json(user);
  } catch (err) {
    console.error("[auth.me]", err);
    return res.status(500).json({ error: "Error al obtener perfil" });
  }
};

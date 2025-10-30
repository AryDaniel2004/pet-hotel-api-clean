import { verifyAccess } from "../lib/auth.js";

/* ======================================================
   🔐 Autenticación: valida el token JWT y agrega req.user
====================================================== */
export function requireAuth(req, res, next) {
  const hdr = req.headers.authorization || "";
  const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: "missing token" });
  }

  try {
    const payload = verifyAccess(token);

    // Normalizamos las posibles claves
    const userId = payload?.id || payload?.sub || payload?.user_id;
    if (!userId) {
      console.error("❌ [requireAuth] Token válido pero sin ID:", payload);
      return res.status(401).json({ error: "invalid token structure" });
    }

    req.user = {
      id: userId,
      email: payload.email || null,
      role: payload.role || "CUSTOMER",
    };

    console.log("✅ [requireAuth] Usuario autenticado:", req.user);
    next();
  } catch (err) {
    console.error("[requireAuth] Error:", err.message);
    res.status(401).json({ error: "unauthorized" });
  }
}

/* ======================================================
   🧩 Autorización: valida si el rol del usuario está permitido
====================================================== */
export function requireRoles(allowedRoles = ["ADMIN"]) {
  // Acepta tanto requireRoles("ADMIN", "CUSTOMER") como requireRoles(["ADMIN", "CUSTOMER"])
  const rolesArray = Array.isArray(allowedRoles)
    ? allowedRoles
    : Array.from(arguments);

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "unauthorized" });
    }

    const userRole = req.user.role;
    if (!rolesArray.includes(userRole)) {
      console.warn(
        `🚫 [requireRoles] Acceso denegado — Rol actual: ${userRole}, Roles permitidos: ${rolesArray.join(", ")}`
      );
      return res.status(403).json({ error: "forbidden" });
    }

    console.log(`✅ [requireRoles] Acceso permitido (${userRole})`);
    next();
  };
}

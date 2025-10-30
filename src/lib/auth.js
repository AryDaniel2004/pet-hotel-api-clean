import 'dotenv/config';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const ACCESS_SECRET  = process.env.JWT_ACCESS_SECRET  || process.env.JWT_SECRET || 'replace_me_later';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET || 'replace_me_later';

const ACCESS_EXPIRES  = process.env.JWT_ACCESS_EXPIRES  || '15m';
const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES || '30d';

export const hashPassword = async (plain) => bcrypt.hash(plain, 10);
export const comparePassword = async (plain, hash) => bcrypt.compare(plain, hash);

export const verifyPassword = comparePassword;

export const signAccess = (user = {}) => {
  // Asegura que el token tenga sub (id) y role
  const payload = {
    sub: user.sub || user.id,        // <- campo estándar JWT
    role: user.role || "CUSTOMER",
  };
  return jwt.sign(payload, ACCESS_SECRET, {
    algorithm: "HS256",
    expiresIn: ACCESS_EXPIRES,
  });
};

export const signRefresh = (payload = {}) =>
  jwt.sign(payload, REFRESH_SECRET, { algorithm: 'HS256', expiresIn: REFRESH_EXPIRES });

export const verifyAccess = (token) => jwt.verify(token, ACCESS_SECRET);
export const verifyRefresh = (token) => jwt.verify(token, REFRESH_SECRET);

export const signAccessToken = signAccess;
export const signRefreshToken = signRefresh;

export const verifyToken = (token) => jwt.verify(token, ACCESS_SECRET);

// src/lib/databases.js
import { Sequelize } from "sequelize";
import "dotenv/config";

// ===== Conexiones =====
const mk = (url) =>
  new Sequelize(url, {
    dialect: "postgres",
    logging: false,
    dialectOptions:
      process.env.NODE_ENV === "production"
        ? { ssl: { require: true, rejectUnauthorized: false } }
        : undefined,
  });

// ====== Conexiones a las bases de datos ======
export const db = {
  auth: mk(process.env.DB_AUTH_URL),
  pets: mk(process.env.DB_PETS_URL),
  inv: mk(process.env.DB_INV_URL),
  book: mk(process.env.DB_BOOK_URL),
};
export const authDb = db.auth;

// ====== Importación de modelos ======

// AUTH
import UserFactory from "../models/auth/user.js";
import RefreshTokenFactory from "../models/auth/RefreshToken.js";
import mkClient from "../models/auth/Client.js";

// INV
import mkRoom from "../models/inv/room.js";
import mkRoomBlock from "../models/inv/RoomBlock.js";
import mkRoomType from "../models/inv/roomType.js";

// BOOK
import mkBooking from "../models/book/booking.js";
import mkBookingItem from "../models/book/bookingItem.js";
import mkBookingService from "../models/book/bookingService.js";
import mkService from "../models/book/Service.js";
import mkPayment from "../models/book/Payment.js";

// PETS
import mkPet from "../models/pets/pet.js";

// ====== Instanciación de modelos ======

// AUTH
const User = UserFactory(db.auth);
const RefreshToken = RefreshTokenFactory(db.auth);
const Client = mkClient(db.auth);

// INV
const RoomType = mkRoomType(db.inv);
const Room = mkRoom(db.inv);
const RoomBlock = mkRoomBlock(db.inv);

// BOOK
const Booking = mkBooking(db.book);
const BookingItem = mkBookingItem(db.book);
const BookingService = mkBookingService(db.book);
const Service = mkService(db.book);
const Payment = mkPayment(db.book);

// PETS
const Pet = mkPet(db.pets);

// ===== Relaciones =====

// AUTH
RefreshToken.belongsTo(User, { foreignKey: "user_id" });
User.hasMany(RefreshToken, { foreignKey: "user_id" });

// INV
Room.belongsTo(RoomType, { foreignKey: "room_type_id" });
RoomType.hasMany(Room, { foreignKey: "room_type_id" });

RoomBlock.belongsTo(Room, { foreignKey: "room_id" });
Room.hasMany(RoomBlock, { foreignKey: "room_id" });

// BOOKING RELATIONS (CORREGIDAS)
Booking.hasMany(BookingItem, { foreignKey: "booking_id" });
BookingItem.belongsTo(Booking, { foreignKey: "booking_id" });

// ✅ Cada BookingItem puede tener varios BookingServices
BookingItem.hasMany(BookingService, { foreignKey: "booking_item_id" });
BookingService.belongsTo(BookingItem, { foreignKey: "booking_item_id" });

// Pagos asociados directamente a la reserva
Booking.hasMany(Payment, { foreignKey: "booking_id" });
Payment.belongsTo(Booking, { foreignKey: "booking_id" });

// Relaciones con Room y Pet
BookingItem.belongsTo(Room, { foreignKey: "room_id" });
Room.hasMany(BookingItem, { foreignKey: "room_id" });

BookingItem.belongsTo(Pet, { foreignKey: "pet_id" });
Pet.hasMany(BookingItem, { foreignKey: "pet_id" });

// ===== Exportación =====
export {
  User,
  RefreshToken,
  Client,
  Room,
  RoomType,
  RoomBlock,
  Booking,
  BookingItem,
  BookingService,
  Service,
  Payment,
  Pet,
};

// ===== Utilidad para verificar conexiones =====
export async function pingAll() {
  for (const [name, conn] of Object.entries(db)) {
    try {
      await conn.authenticate();
      console.log(`[db] ${name} OK`);
    } catch (e) {
      console.error(`[db] ${name} FAIL -> ${e.message}`);
      throw new Error(`${name}: ${e.message}`);
    }
  }
}

import { db } from '../lib/databases.js';

// AUTH
import userFactory from './auth/user.js';
export const User = userFactory(db.auth);

// PETS
import petFactory from './pets/pet.js';
export const Pet = petFactory(db.pets);

// INVENTORY
import roomTypeFactory from './inv/roomType.js';
import roomFactory from './inv/room.js';
import serviceFactory from './inv/service.js';
export const RoomType = roomTypeFactory(db.inv);
export const Room = roomFactory(db.inv);
export const Service = serviceFactory(db.inv);

// BOOKINGS
import bookingFactory from './book/booking.js';
import bookingItemFactory from './book/bookingItem.js';
import bookingServiceFactory from './book/bookingService.js';
export const Booking = bookingFactory(db.book);
export const BookingItem = bookingItemFactory(db.book);
export const BookingService = bookingServiceFactory(db.book);


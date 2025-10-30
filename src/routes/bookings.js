import { Router } from 'express';
import { createBooking, getBookingById, cancelBooking } from '../controllers/bookings.controller.js';

const r = Router();
r.post('/bookings', createBooking);
r.get('/bookings/:id', getBookingById);
r.patch('/bookings/:id/cancel', cancelBooking); 

export default r;

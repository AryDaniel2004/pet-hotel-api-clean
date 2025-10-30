import { Router } from 'express';
import { availability } from '../controllers/rooms.controller.js';
const r = Router();

r.get('/rooms/availability', availability); 

export default r;

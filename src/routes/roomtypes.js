import { Router } from 'express';
import { listRoomTypes } from '../controllers/roomtypes.controller.js';

const r = Router();
r.get('/room-types', listRoomTypes);

export default r;

import { Router } from 'express';
import { getAvailability } from '../controllers/availability.controller.js';
const router = Router();
router.get('/rooms/availability', getAvailability);
export default router;

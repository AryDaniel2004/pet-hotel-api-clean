import { Router } from 'express';
import { listServices } from '../controllers/services.controller.js';

const r = Router();
r.get('/services', listServices);

export default r;

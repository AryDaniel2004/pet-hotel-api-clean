import { Router } from 'express';
import {
  createClient,
  getAllClients,
  getClientById,
  updateClient,
  deleteClient
} from '../controllers/clients.controller.js';

const r = Router();

r.post('/clients', createClient);
r.get('/clients', getAllClients);
r.get('/clients/:id', getClientById);
r.put('/clients/:id', updateClient);
r.delete('/clients/:id', deleteClient);

export default r;

import { Router } from 'express';
import {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
} from '../controllers/employees.controller.js';

const r = Router();

r.get('/employees', getAllEmployees);
r.get('/employees/:id', getEmployeeById);
r.post('/employees', createEmployee);
r.put('/employees/:id', updateEmployee);
r.delete('/employees/:id', deleteEmployee);

export default r;

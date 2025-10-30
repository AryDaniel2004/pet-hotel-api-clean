import { Router } from 'express';

import health from './health.js';
import rooms from './rooms.js';
import bookings from './bookings.js';
import services from './services.js';
import roomtypes from './roomtypes.js';
import clients from './clients.routes.js';      
import employees from './employees.routes.js';  

const r = Router();

r.use(health);
r.use(rooms);
r.use(bookings);
r.use(services);
r.use(roomtypes);
r.use(clients);     
r.use(employees);  

export default r;

import { Router } from 'express';

import ScheduleController from './app/controllers/ScheduleController';

const routes = new Router();

routes.post('/schedule', ScheduleController.store);
routes.delete('/schedule/:id', ScheduleController.delete);
routes.get('/schedule', ScheduleController.index);
routes.get('/schedule/available', ScheduleController.available);

export default routes;

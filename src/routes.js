import { Router } from 'express';

import UserController from './app/controllers/UserController';
import StudentController from './app/controllers/StudentController';
import SessionController from './app/controllers/SessionController';
import PlanController from './app/controllers/PlanController';
import EnrollmentController from './app/controllers/EnrollmentController';
import CheckinController from './app/controllers/CheckinController';
import HelpOrdersController from './app/controllers/HelpOrderController';
import GymController from './app/controllers/GymController';
import auth from './app/middlewares/auth';

const routes = new Router();

// gyms [ok]

routes.get('/gyms', GymController.index);
routes.post('/gyms', GymController.store);

// session [ok]
routes.post('/sessions', SessionController.store);

// checkin [ok]
routes.get('/students/:student_id/checkin', CheckinController.index);
routes.post('/students/:student_id/checkin', CheckinController.store);

// hel-orders [ok]
routes.post('/students/:student_id/help-orders', HelpOrdersController.store);
routes.get('/students/:student_id/help-orders', HelpOrdersController.show);

// user [ok]
routes.post('/users', UserController.store);

routes.use(auth);

// require auth

// gym [ok]

routes.put('/gyms', GymController.update);
routes.delete('/gyms', GymController.delete);

// help-orders [ok]
routes.get('/help-orders', HelpOrdersController.index);
routes.delete('/help-orders/:help_order_id', HelpOrdersController.delete);
routes.put('/help-orders/:help_order_id/answer', HelpOrdersController.update);

// users [ok]

routes.put('/users', UserController.update);
routes.get('/users', UserController.index);

// students [ok]
routes.post('/students', StudentController.store);
routes.put('/students/:id', StudentController.update);
routes.get('/students/:student_id', StudentController.show);
routes.get('/students', StudentController.index);
routes.delete('/students/:student_id', StudentController.delete);

// plans [ok]
routes.get('/plans', PlanController.index);
routes.get('/plans/:plan_id', PlanController.show);
routes.post('/plans', PlanController.store);
routes.put('/plans/:plan_id', PlanController.update);
routes.delete('/plans/:plan_id', PlanController.delete);

// enrollments
routes.get('/enrollments', EnrollmentController.index);
routes.post('/enrollments', EnrollmentController.store);
routes.put('/enrollments/:enrollment_id', EnrollmentController.update);
routes.delete('/enrollments/:enrollment_id', EnrollmentController.delete);

export default routes;

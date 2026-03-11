import { Router } from 'express';
import authRoutes from './authRoutes';
import examRoutes from './examRoutes';
import attemptRoutes from './attemptRoutes';
import proctorRoutes from './proctorRoutes';

export const routes = Router();

routes.use('/auth', authRoutes);
routes.use('/exams', examRoutes);
routes.use('/', attemptRoutes);
routes.use('/proctor', proctorRoutes);


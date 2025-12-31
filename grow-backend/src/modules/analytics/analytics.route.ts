import express from 'express';
import { getAnalytics } from './analytics.controller.js';
import { requireAuth, requireRoles } from '../../middleware/auth.js';

const router = express.Router();

// Get analytics - Admin only
router.get('/', requireAuth, requireRoles('admin'), getAnalytics);

export default router;

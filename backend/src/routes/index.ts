import { Router } from 'express';

import { authRouter } from './auth.routes';
import { adminUserRouter } from './admin-user.routes';

const router = Router();

router.use('/auth', authRouter);
router.use('/admin/users', adminUserRouter);

export { router as apiRouter };

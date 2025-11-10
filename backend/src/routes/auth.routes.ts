import { celebrate, Joi, Segments } from 'celebrate';
import { Router } from 'express';

import { login, logout, refresh, register } from '../controllers/auth.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router();

const credentialsSchema = Joi.object({
  email: Joi.string().email().lowercase().trim().required(),
  password: Joi.string().min(8).max(128).required()
});

router.post(
  '/register',
  celebrate({
    [Segments.BODY]: credentialsSchema.keys({
      fullName: Joi.string().max(120).allow('', null)
    })
  }),
  register
);

router.post(
  '/login',
  celebrate({
    [Segments.BODY]: credentialsSchema
  }),
  login
);

router.post(
  '/refresh',
  celebrate({
    [Segments.BODY]: Joi.object({
      refreshToken: Joi.string().optional()
    })
  }),
  refresh
);

router.post('/logout', authenticate, logout);

export { router as authRouter };
